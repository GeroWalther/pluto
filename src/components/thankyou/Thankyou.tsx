'use client';
import { formatPrice } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import PaymentStatus from '../comp/PaymentStatus';
import Loader from '../Loader/Loader';
import ErrorPageComp from '../comp/ErrorPageComp';

interface ThankyouProps {
  orderId: string;
}

const Thankyou: FC<ThankyouProps> = ({ orderId }) => {
  const {
    data: response,
    isLoading,
    isError,
  } = trpc.payment.confirmPurchase.useQuery({
    orderId,
  });

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
              <ErrorPageComp paramsMissing={false} />
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
                              <div className='space-y-1'>
                                <h3 className='text-stone-900'>
                                  {product.name}
                                </h3>

                                <p className='my-1'>
                                  Category: {product.category}
                                </p>
                              </div>

                              <div className='space-y-1'>
                                {product.imageUrls.map((url, index) => {
                                  return (
                                    // TODO this download is not working
                                    <a
                                      href={url}
                                      download={product.name}
                                      className='text-blue-600 hover:underline underline-offset-2 p-2'
                                      key={index}>
                                      File {index + 1}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>

                            <p className='flex-none font-medium text-stone-900'>
                              {formatPrice(product.price)}
                            </p>
                          </li>
                        );
                      })}
                  </ul>

                  <div className='space-y-6 border-t border-stone-200 pt-6 text-sm font-medium text-muted-foreground'>
                    <div className='flex justify-between'>
                      <p>Total</p>
                      <p className='text-stone-900'>
                        {formatPrice(response?.total!)}
                      </p>
                    </div>
                  </div>
                  {/* TODO : add all download links into 1 zip file and show a download a tag */}
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
