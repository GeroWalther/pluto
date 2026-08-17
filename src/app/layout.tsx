import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { extractRouterConfig } from 'uploadthing/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AllProviders from '@/globalProviders/AllProviders';
import { constructMetadata } from '@/lib/utils';
import { ourFileRouter } from './api/uploadthing/core';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = constructMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={inter.variable}>
      <body className={`${inter.className} flex min-h-screen flex-col antialiased`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <AllProviders>
          <Toaster position='top-center' richColors closeButton />
          <Navbar />
          <main className='flex-1'>{children}</main>
          <Footer />
        </AllProviders>
      </body>
    </html>
  );
}
