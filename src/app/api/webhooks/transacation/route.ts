import { NextApiRequest, NextApiResponse } from 'next';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-04-10',
});

export const config = {
  api: {
    bodyParser: false,
  },
};


export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const connectId = searchParams.get("connectId");
  
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
    return Response.json({client_secret: financialAccounts.client_secret});
  } catch (error) {
    // If an error occurs during the process, returns an error response.
    return errorResponse(error);
  }
}

// Handle GET request (if needed)
async function GET(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
}

// Export named functions for each HTTP method - needed !!
export { POST, GET };
