import { z } from "zod";

const envSchema = z.object({
  // GitHub App — optional at boot, validated at auth time
  GITHUB_APP_ID: z.string().default(""),
  GITHUB_APP_SLUG: z.string().default("pixlog"),
  GITHUB_APP_PRIVATE_KEY: z.string().default(""),
  GITHUB_CLIENT_ID: z.string().default(""),
  GITHUB_CLIENT_SECRET: z.string().default(""),

  // NextAuth
  NEXTAUTH_SECRET: z.string().default("dev-secret-change-in-production"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000").optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Validated, typed environment variables.
 * Throws at startup if any required var is missing or malformed.
 */
export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
