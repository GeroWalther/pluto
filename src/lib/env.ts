import { z } from 'zod';

/**
 * Validated environment. Importing this from a server module fails the build
 * (or the first request) with a readable message instead of producing a
 * mystery `undefined` deep inside a Stripe call.
 */
const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  DOWNLOAD_TOKEN_SECRET: z.string().min(1, 'DOWNLOAD_TOKEN_SECRET is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  RESEND_API_KEY: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('Pluto Market <onboarding@resend.dev>'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GITHUB_ID: z.string().optional().default(''),
  GITHUB_SECRET: z.string().optional().default(''),
});

// Next inlines `process.env.NEXT_PUBLIC_*` at build time only when referenced
// statically, so this one cannot be read through a computed key.
export const SERVER_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

let cached: z.infer<typeof serverSchema> | null = null;

export function env() {
  if (cached) return cached;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Invalid environment configuration:\n${missing}\n\nCopy .env.example to .env and fill it in.`
    );
  }

  cached = parsed.data;
  return cached;
}

export const hasGoogleAuth = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const hasGithubAuth = () =>
  Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
