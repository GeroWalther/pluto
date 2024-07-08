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

// Handle POST request
async function POST(req: Request,  res: NextApiResponse) {
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

        // Extract keys for 'amount' and 'destination'
        const amountKeys = Object.keys(metadata).filter(key => key.startsWith('amount'));
        const destinationKeys = Object.keys(metadata).filter(key => key.startsWith('destination'));
      //  const transferPromises: Promise<Stripe.Transfer>[] = [];

        for (let i = 0; i < amountKeys.length; i++) {

          const amountStr = metadata[amountKeys[i]];
          const amount = Math.round(parseFloat(amountStr) * 100); 
          const destination = metadata[destinationKeys[i]];

            stripe.transfers.create({
              amount: amount,
              currency: session.currency ?? 'eur',
              destination: destination,
              source_transaction: session.id,
            })
       
        }

        // Promise.all(transferPromises)
        //   .then((transfers) => {

        //     console.log('Transfers completed:', transfers);
        //     return new Response(JSON.stringify({ transfers }));
        //   })
        //   .catch((error) => {

        //     console.error('Error completing transfers:', error);
        //   });

          return new Response(JSON.stringify({ destinationKeys }));
       
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
