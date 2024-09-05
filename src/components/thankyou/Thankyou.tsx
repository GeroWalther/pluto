'use client';
import { formatPrice } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { Download, Eye, File } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import Loader from '../Loader/Loader';
import ErrorPageComp from '../comp/ErrorPageComp';
import PaymentStatus from '../comp/PaymentStatus';
import { useCart } from '@/hooks/use-cart';
import JSZip from 'jszip';

interface ThankyouProps {
  orderId: string;
}

const Thankyou: FC<ThankyouProps> = ({ orderId }) => {
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = trpc.payment.confirmPurchase.useQuery({
    orderId,
  });

  const [downloadStatus, setDownloadStatus] = useState<{
    [key: string]: string;
  }>({});

  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, []);

  const getFileExtension = (url: string): string => {
    return url.split('.').pop()?.toLowerCase() || '';
  };

  const canViewInBrowser = (url: string): boolean => {
    const extension = getFileExtension(url);
    return [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'pdf',
      'svg',
      'webp',
      'txt',
      'json',
      'js',
      'xml',
    ].includes(extension);
  };

  const downloadFile = async (url: string, fileName: string) => {
    setDownloadStatus((prev) => ({ ...prev, [url]: 'downloading' }));
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Not able to load file');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      //to release memory
      setDownloadStatus((prev) => ({ ...prev, [url]: 'success' }));
    } catch (error) {
      setDownloadStatus((prev) => ({ ...prev, [url]: 'error' }));
    }
  };

  const downloadAllFiles = async () => {
    if (!response) return;

    setDownloadStatus({ all: 'downloading' });
    const zip = new JSZip();
    const fetchPromises = response.getProducts.flatMap((product) =>
      product.imageUrls.map(async (url, index) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}`);
          const blob = await response.blob();
          const fileName = `${product.name}_${index + 1}.${getFileExtension(
            url
          )}`;
          zip.file(fileName, blob);
          return { success: true, fileName };
        } catch (error) {
          console.error(`Error fetching file ${url}:`, error);
          return { success: false, url };
        }
      })
    );

    const results = await Promise.all(fetchPromises);
    const failedDownloads = results.filter((result) => !result.success);

    if (failedDownloads.length > 0) {
      console.warn('Some files failed to download:', failedDownloads);
      setDownloadStatus((prev) => ({ ...prev, all: 'partial' }));
    } else {
      try {
        const content = await zip.generateAsync({ type: 'blob' });
        const zipUrl = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = 'pluto_files.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(zipUrl);
        setDownloadStatus((prev) => ({ ...prev, all: 'success' }));
      } catch (error) {
        console.error('Error creating zip file:', error);
        setDownloadStatus((prev) => ({ ...prev, all: 'error' }));
      }
    }
  };

  const viewFile = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <main className='relative lg:min-h-full'>
      <div className='hidden lg:block overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12'>
        <Image
          fill
          src={'/eis.jpg'}
          className='h-full w-full object-cover object-center'
          alt='thank you for your order'
        />
      </div>

      <div>
        <div className='mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24'>
          <div className='lg:col-start-2'>
            {isLoading ? (
              <div className='flex justify-center items-start '>
                <div className='flex-col justify-center items-center min-h-screen'>
                  <p className='font-semibold text-muted-foreground p-5 '>
                    Processing order, please wait a second or two...
                  </p>
                  <div className='ml-44'>
                    <Loader />
                  </div>
                </div>
              </div>
            ) : isError ? (
              <>
                <p className='text-red-700'>{error.message}</p>
                <ErrorPageComp paramsMissing={false} />
              </>
            ) : (
              <>
                <p className='text-sm font-medium text-green-500'>
                  Order successful
                </p>
                <h1 className='mt-2 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl'>
                  Thanks for ordering
                </h1>
                <p className='mt-2 text-base text-muted-foreground'>
                  We appreciate your order, and we hope you enjoy your order.
                  Please download your purchase and visit us soon again.
                </p>
                <div className='mt-10 text-sm font-medium'>
                  <div className='text-muted-foreground'>Order nr.</div>
                  <div className='mt-2 text-stone-900'>{response?.orderId}</div>

                  <ul className='mt-6 divide-y divide-stone-200 border-t border-stone-200 text-sm font-medium text-muted-foreground'>
                    {response &&
                      response.getProducts.map((product) => {
                        return (
                          <li key={product.id} className='flex space-x-6 py-6'>
                            <div className='relative h-24 w-24'>
                              <Image
                                fill
                                src={product.imageUrls[0]}
                                alt={`${product.name} image`}
                                className='flex-none rounded-md bg-stone-100 object-cover object-center'
                              />
                            </div>

                            <div className='flex-auto flex flex-col justify-between'>
                              <div className='space-y-1 mb-4'>
                                <h3 className='text-stone-900'>
                                  {product.name}
                                </h3>

                                <p className='my-1'>
                                  Category: {product.category}
                                </p>
                              </div>

                              <div className='space-y-1'>
                                {product.imageUrls.map((url, index) => (
                                  <div
                                    key={index}
                                    className='flex items-center space-x-2 py-2'>
                                    <button
                                      onClick={() =>
                                        downloadFile(
                                          url,
                                          `${product.name}_${
                                            index + 1
                                          }.${getFileExtension(url)}`
                                        )
                                      }
                                      className='text-blue-600 hover:underline underline-offset-2 flex items-center'
                                      disabled={
                                        downloadStatus[url] === 'downloading'
                                      }>
                                      <Download className='w-5 h-5 mr-1' />
                                      <span>
                                        {downloadStatus[url] === 'downloading'
                                          ? 'Downloading...'
                                          : downloadStatus[url] === 'success'
                                          ? 'Downloaded'
                                          : downloadStatus[url] === 'error'
                                          ? 'Retry Download'
                                          : 'Download'}
                                      </span>
                                    </button>
                                    {canViewInBrowser(url) && (
                                      <button
                                        onClick={() => viewFile(url)}
                                        className='text-blue-600 hover:underline underline-offset-2 flex items-center'>
                                        <Eye className='w-5 h-5 mr-1' />
                                        View
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <p className='flex-none font-medium text-stone-900'>
                              {formatPrice(product.price)}
                            </p>
                          </li>
                        );
                      })}
                  </ul>
                  {/* TODO add transaction fee */}
                  <div className=' border-t border-stone-200 pt-6 text-sm font-medium text-muted-foreground'>
                    <div className='flex justify-between'>
                      <p>Total</p>
                      <p className='text-stone-900'>
                        {formatPrice(response?.total!)}
                      </p>
                    </div>
                  </div>

                  <div className='mt-5'>
                    <button
                      onClick={downloadAllFiles}
                      className='text-blue-600 hover:underline underline-offset-2 text-lg'
                      disabled={downloadStatus.all === 'downloading'}>
                      {downloadStatus.all === 'downloading'
                        ? 'Downloading All...'
                        : downloadStatus.all === 'partial'
                        ? 'Some Files Downloaded'
                        : downloadStatus.all === 'error'
                        ? 'Retry Download All'
                        : 'Download All Files'}
                    </button>
                  </div>

                  <PaymentStatus
                    isPaid={response?.isPaid!}
                    orderEmail={response?.email!}
                    orderId={response?.orderId!}
                  />

                  <div className='mt-16 border-t border-stone-200 py-6 text-right'>
                    <Link
                      href='/products'
                      className='text-sm font-medium text-blue-600 hover:text-blue-500'>
                      Continue shopping &rarr;
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Thankyou;
