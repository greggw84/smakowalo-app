import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'SET (whsec_...)' : 'MISSING',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 'SET (sk_live_...)' : 'MISSING',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'MISSING',
    webhookEndpoint: '/api/webhooks/stripe',
    fullWebhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://smakowalo.pl'}/api/webhooks/stripe`,
  };

  return NextResponse.json({
    status: 'Debug Info',
    config,
    timestamp: new Date().toISOString(),
    warning: 'This endpoint should be disabled in production!',
  });
}
