// Environment variables validation
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnv(name: string, defaultValue = ''): string {
  return process.env[name] || defaultValue;
}

// Validated environment variables
export const env = {
  // Site Configuration
  NEXT_PUBLIC_SITE_URL: getOptionalEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),

  // NextAuth
  NEXTAUTH_URL: getOptionalEnv('NEXTAUTH_URL', 'http://localhost:3000'),
  NEXTAUTH_SECRET: getRequiredEnv('NEXTAUTH_SECRET'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: getOptionalEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  STRIPE_SECRET_KEY: getOptionalEnv('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: getOptionalEnv('STRIPE_WEBHOOK_SECRET'),

  // OAuth
  FACEBOOK_CLIENT_ID: getOptionalEnv('FACEBOOK_CLIENT_ID'),
  FACEBOOK_CLIENT_SECRET: getOptionalEnv('FACEBOOK_CLIENT_SECRET'),
  GOOGLE_CLIENT_ID: getOptionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getOptionalEnv('GOOGLE_CLIENT_SECRET'),

  // Email
  EMAIL_SERVER_HOST: getOptionalEnv('EMAIL_SERVER_HOST'),
  EMAIL_SERVER_PORT: getOptionalEnv('EMAIL_SERVER_PORT'),
  EMAIL_SERVER_USER: getOptionalEnv('EMAIL_SERVER_USER'),
  EMAIL_SERVER_PASSWORD: getOptionalEnv('EMAIL_SERVER_PASSWORD'),
  EMAIL_FROM: getOptionalEnv('EMAIL_FROM'),
  SENDGRID_API_KEY: getOptionalEnv('SENDGRID_API_KEY'),
  SENDGRID_FROM_EMAIL: getOptionalEnv('SENDGRID_FROM_EMAIL'),
} as const;
