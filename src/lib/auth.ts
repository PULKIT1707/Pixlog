import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { env } from "@/lib/env";
import { getInstallationId } from "@/lib/github/app";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.login = (profile as any).login as string;
        token.avatarUrl = (profile as any).avatar_url as string;
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.login = token.login as string;
      session.user.avatarUrl = token.avatarUrl as string;
      session.user.accessToken = token.accessToken as string;
      session.user.installationId = await getInstallationId(token.login as string);
      return session;
    },
  },
});
