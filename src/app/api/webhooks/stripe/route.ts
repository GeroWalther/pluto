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

// Utility function to sleep for a given number of milliseconds
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to retry charge retrieval until it succeeds or reaches a maximum number of attempts
async function retrieveChargeWithRetry(chargeId: string, maxRetries: number = 5, delayMs: number = 3000) {
  let charge: Stripe.Charge | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    charge = await stripe.charges.retrieve(chargeId);
    if (charge.status === 'succeeded' && charge.balance_transaction) {
      break;
    }
    await sleep(delayMs);
  }
  return charge;
}

// Handle POST request
async function POST(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {

    const body = await req.text();
    const sig = headers().get('Stripe-Signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;
    try {
      if (!sig || !webhookSecret) return;
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.log(`❌ Error message: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      try {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve metadata from session
        const metadata = session.metadata as Record<string, string>;

        // Assert the type of paymentIntent to include charges
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        const chargeId = paymentIntent.latest_charge;

        if (!chargeId) {
          throw new Error('No charges found for this PaymentIntent');
        }

        // Retrieve the charge with retry mechanism
        const charge = await retrieveChargeWithRetry(chargeId);

        if (!charge || charge.status !== 'succeeded' || !charge.balance_transaction) {
          throw new Error(`Charge ${chargeId} did not succeed or has no balance_transaction.`);
        }

        // Extract keys for 'amount' and 'destination'
        const amountKeys = Object.keys(metadata).filter(key => key.startsWith('amount'));
        const destinationKeys = Object.keys(metadata).filter(key => key.startsWith('destination'));
        const transferPromises: Promise<Stripe.Transfer>[] = [];

        for (let i = 0; i < amountKeys.length; i++) {
          const amountStr = metadata[amountKeys[i]];
          const amount = Math.round(parseFloat(amountStr) * 100);
          const destination = metadata[destinationKeys[i]];

          transferPromises.push(
            stripe.transfers.create({
              amount: amount,
              currency: session.currency ?? 'eur',
              destination: destination,
              source_transaction: charge.id,
            })
          );
        }

        const transfers = await Promise.all(transferPromises);
        return new Response(JSON.stringify({ transfers }));

      } catch (error) {
        console.log(error);
        return new Response('Webhook handler failed. View logs.', {
          status: 400
        });
      }
    }
  } else {
    console.log(`Method not allowed: ${req.method}`);
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}

// Handle GET request (if needed)
async function GET(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Allow', 'POST');
  res.status(405).end('Method Not Allowed');
}

// Export named functions for each HTTP method - needed !!
export { POST, GET };
