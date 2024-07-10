"use client";
import { useEffect } from 'react';

const MetadataComponent = () => {
  const metadata = {
    "productId_1": "6687db2f726ccb593d78c1c6",
    "amount_1": "190",
    "productId_0": "6664514543f6dfed37b6c81b",
    "userId_0": "666078f369c8f5b7807cda4d",
    "amount_0": "37.05",
    "userId_1": "6687da2d726ccb593d78c1c5",
    "destination_1": "acct_1PZATHR2LlwapINJ",
    "destination_0": "acct_1PWKYkQsTcpKRsNe"
  };

  // Extract keys for 'amount' and 'destination'
  const amountKeys = Object.keys(metadata).filter(key => key.startsWith('amount'));
  const destinationKeys = Object.keys(metadata).filter(key => key.startsWith('destination'));

  useEffect(() => {
    for (let i = 0; i < amountKeys.length; i++) {
      console.log(`Pair ${i + 1}`);
      console.log(`${amountKeys[i]}: ${metadata[amountKeys[i]]}`);
      console.log(`${destinationKeys[i]}: ${metadata[destinationKeys[i]]}`);
    }
  }, [amountKeys, destinationKeys]);

  return (
    <div>
      <h1>Metadata Items</h1>
      <ul>
        {amountKeys.map((_, i) => (
          <li key={i}>
            <strong>Pair {i + 1}</strong>
            <ul>
              <li>{amountKeys[i]}: {metadata[amountKeys[i]]}</li>
              <li>{destinationKeys[i]}: {metadata[destinationKeys[i]]}</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MetadataComponent;
