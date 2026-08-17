'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared/states';

function GoogleIcon() {
  return (
    <svg viewBox='0 0 24 24' className='mr-2 h-4 w-4' aria-hidden>
      <path
        fill='#4285F4'
        d='M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2 3.44-4.96 3.44-8.57Z'
      />
      <path
        fill='#34A853'
        d='M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.03-6.45-4.75H1.71v2.98A11.5 11.5 0 0 0 12 24Z'
      />
      <path
        fill='#FBBC05'
        d='M5.55 14.67a6.9 6.9 0 0 1 0-4.4V7.29H1.71a11.51 11.51 0 0 0 0 10.36l3.84-2.98Z'
      />
      <path
        fill='#EA4335'
        d='M12 4.75c1.69 0 3.2.58 4.4 1.72l3.3-3.29C17.71 1.2 15.1 0 12 0 7.48 0 3.57 2.59 1.71 6.36l3.84 2.98C6.46 6.78 9 4.75 12 4.75Z'
      />
    </svg>
  );
}

/**
 * Only renders providers that are actually configured — an unconfigured
 * button would just send the user to a Stripe-style error page.
 */
export function OAuthButtons({
  google,
  github,
  callbackUrl = '/',
}: {
  google: boolean;
  github: boolean;
  callbackUrl?: string;
}) {
  const [pending, setPending] = useState<string | null>(null);

  if (!google && !github) return null;

  return (
    <>
      <div className='grid gap-2'>
        {google ? (
          <Button
            type='button'
            variant='outline'
            disabled={pending !== null}
            onClick={() => {
              setPending('google');
              signIn('google', { callbackUrl });
            }}>
            {pending === 'google' ? <Spinner className='mr-2' /> : <GoogleIcon />}
            Continue with Google
          </Button>
        ) : null}

        {github ? (
          <Button
            type='button'
            variant='outline'
            disabled={pending !== null}
            onClick={() => {
              setPending('github');
              signIn('github', { callbackUrl });
            }}>
            {pending === 'github' ? (
              <Spinner className='mr-2' />
            ) : (
              <Github className='mr-2 h-4 w-4' />
            )}
            Continue with GitHub
          </Button>
        ) : null}
      </div>

      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-stone-200' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-white px-2 text-muted-foreground'>or</span>
        </div>
      </div>
    </>
  );
}
