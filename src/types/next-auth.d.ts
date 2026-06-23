import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login: string;
      avatarUrl: string;
      accessToken: string;
      installationId: number | null;
    };
  }
}
