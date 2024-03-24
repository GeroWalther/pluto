import Navbar from '@/components/comp/Navbar';
import AllProviders from '@/globalProviders/AllProviders';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { constructMetadata } from '@/lib/utils';
const inter = Inter({ subsets: ['latin'] });
export const metadata = constructMetadata();

//uploadthing
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import { ourFileRouter } from './api/uploadthing/core';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <AllProviders>
          <Toaster position='top-center' richColors />
          <Navbar />
          {children}
        </AllProviders>
      </body>
    </html>
  );
}
