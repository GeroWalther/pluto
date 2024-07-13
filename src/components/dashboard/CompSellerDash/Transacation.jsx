import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
    ConnectComponentsProvider,
    ConnectPayments,
} from "@stripe/react-connect-js";
import { useState } from 'react';

export default function Transacation({ conncetId }) {

    // We use `useState` to ensure the Connect instance is only initialized once
    const [stripeConnectInstance] = useState(() => {
        const fetchClientSecret = async () => {

            const response = await fetch(`/api/webhooks/transacation?connectId=${conncetId}`, { method: "POST" });
            const { client_secret: clientSecret } = await response.json();
            return clientSecret;


        }

        return loadConnectAndInitialize({
            // This is your test publishable API key.
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
            fetchClientSecret: fetchClientSecret,
            fonts: [
                {
                  cssSrc: 'https://fonts.cdnfonts.com/css/font',
                },
              ],
            appearance: {
            // See all possible variables below
            overlays: "dialog",
            variables: {
                fontFamily: 'My Font',
                colorPrimary: "#FF0000",
            },
            },
        })
    });

    return (
        <div className="container">
            <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                <ConnectPayments />
            </ConnectComponentsProvider>
        </div>
    )
}