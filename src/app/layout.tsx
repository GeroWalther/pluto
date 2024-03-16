import Navbar from '@/components/comp/Navbar';
import AllProviders from '@/globalProviders/AllProviders';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { constructMetadata } from '@/lib/utils';
const inter = Inter({ subsets: ['latin'] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <AllProviders>
          <Toaster position='top-center' richColors />
          <Navbar />
          {children}
        </AllProviders>
      </body>
    </html>
  );
}
