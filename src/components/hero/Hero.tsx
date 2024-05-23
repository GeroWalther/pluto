'use client';
import Link from 'next/link';
import { Button, buttonVariants } from '../ui/button';
import React, { useEffect, useRef } from 'react';

export default function Hero() {
  return (
    <>
      <div className='relative'>
        <Canvas className='absolute top-0 left-0 -z-10' />
        <div className='py-8 mx-auto text-center flex flex-col items-center max-w-3xl'>
          <div className='relative'>
            <h1
              className='sm:mb-8 text-4xl font-bold tracking-tight text-stone-700 sm:text-6xl mt-20'
              style={{ mixBlendMode: 'color-burn' }}>
              Your marketplace for high-quality{' '}
              <span className='text-stone-400'>digital assets</span>.
            </h1>
            <p
              aria-hidden='true'
              className='sm:mb-8 text-4xl font-bold tracking-tight text-stone-700 sm:text-6xl mt-20 absolute top-0 left-0 -z-30'
              style={{ mixBlendMode: 'revert' }}>
              Your marketplace for high-quality{' '}
              <span className='text-stone-400'>digital assets</span>.
            </p>
          </div>
          <div className='relative'>
            <p
              className='mt-6 text-lg max-w-prose text-muted-foreground '
              style={{ mixBlendMode: 'color-burn' }}>
              Welcome to Pluto Market. Every asset on our platform is verified
              by our team to ensure our highest quality standards.
            </p>
            <p
              aria-hidden='true'
              className='mt-6 text-lg max-w-prose text-muted-foreground absolute top-0 left-0 -z-30'
              style={{ mixBlendMode: 'revert' }}>
              Welcome to Pluto Market. Every asset on our platform is verified
              by our team to ensure our highest quality standards.
            </p>
          </div>
          <div className='flex flex-col sm:flex-row gap-4 mt-6'>
            <Link href='/products' className={buttonVariants()}>
              Browse Trending
            </Link>
            <Button variant='outline'>Our quality promise &rarr;</Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Canvas({ className }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const col = (x: number, y: number, r: number, g: number, b: number) => {
      if (ctx) ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx?.fillRect(x, y, 1, 1);
    };

    const R = (x: number, y: number, t: number) => {
      return Math.floor(255 * Math.cos((x * x - y * y) / 300 + t));
    };

    const G = (x: number, y: number, t: number) => {
      return Math.floor(
        128 +
          64 *
            Math.sin((x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300)
      );
    };

    const B = (x: number, y: number, t: number) => {
      return Math.floor(
        192 +
          64 *
            Math.sin(
              5 * Math.sin(t / 9) +
                ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100
            )
      );
    };

    let t = 0;

    const run = () => {
      for (let x = 0; x <= 35; x++) {
        for (let y = 0; y <= 35; y++) {
          col(x, y, R(x, y, t), G(x, y, t), B(x, y, t));
        }
      }
      t = t + 0.01;
      window.requestAnimationFrame(run);
    };

    run();
  }, []);

  return (
    <canvas
      id='canv'
      className={`w-full ${className}`}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 10%, 0% 100%)',
        height: '75vh',
        background: 'linear-gradient(45deg, #ff0084, #3300ff)',
      }}
      width='32'
      height='32'
      ref={canvasRef}></canvas>
  );
}

//old header
/* <div className='py-8 mx-auto text-center flex flex-col items-center max-w-3xl'>
 <h1 className='sm:mb-8 text-4xl font-bold tracking-tight text-stone-700 sm:text-6xl '>
Your marketplace for high-quality{' '}
<span className='text-stone-400'>digital assets</span>.
</h1>
<p className=' mt-6 text-lg max-w-prose text-muted-foreground'>
Welcome to Pluto Market. Every asset on our platform is verified by
our team to ensure our highest quality standards.
</p>
<div className='flex flex-col sm:flex-row gap-4 mt-6'>
<Link href='/products' className={buttonVariants()}>
  Brows Trending
</Link>
<Button variant='outline'>Our quality promite &rarr;</Button>
</div>
</div> */
