import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';

export default function IsProAd() {
  //todo check the users tier
  const isPro = false;
  if (isPro) return;
  return (
    <div className='mt-auto p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Upgrade to Pro</CardTitle>
          <CardDescription>
            Unlock all features and get unlimited product listings and access to
            our seller support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size='sm' className='w-full'>
            Upgrade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
