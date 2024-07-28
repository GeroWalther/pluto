import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const connectId = searchParams.get("connectId");

  if (!connectId) {
    return NextResponse.json({ error: 'connectId is required' }, { status: 400 });
  }

  try {
    const financialAccounts = await stripe.accountSessions.create({
      account: connectId,
      components: {
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
          }
        },
      }
    });

    return NextResponse.json({ client_secret: financialAccounts.client_secret }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error occurred" }, { status: 500 });
  }
}
