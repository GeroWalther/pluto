import { notFound } from 'next/navigation';
import { ProductStatus } from '@prisma/client';
import prisma from '@/db/db';
import { constructMetadata } from '@/lib/utils';
import ProductDetail from './ProductDetail';

type Props = { params: Promise<{ slug: string }> };

// Next 15 hands route params over as a promise.
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, imageUrls: true, status: true },
  });

  if (!product || product.status !== ProductStatus.APPROVED) {
    return constructMetadata({ title: 'Product not found — Pluto Market' });
  }

  return constructMetadata({
    title: `${product.name} — Pluto Market`,
    description: product.description.slice(0, 160),
    image: product.imageUrls[0],
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const exists = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!exists) notFound();

  return <ProductDetail slug={slug} />;
}
