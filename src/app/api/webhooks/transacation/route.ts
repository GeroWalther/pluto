import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-04-10',
});

export async function POST(req: Request, res: NextApiResponse) {
  const { searchParams } = new URL(req.url);
  const connectId = searchParams.get("connectId");

  if (!connectId) {
    return res.status(400).json({ error: 'connectId is required' });
  }

  try {
    // Verifies the Firebase ID token from the request to authenticate the user.

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

    // Returns a JSON response containing data for the authenticated user and the user specified by the username.
    return res.status(200).json({client_secret: financialAccounts.client_secret});
  } catch (error) {
    // If an error occurs during the process, returns an error response.
    return res.status(500).json({ error: "Error occoured" });
  }
}
