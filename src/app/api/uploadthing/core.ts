import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import prisma from '@/db/db';
import { createProduct } from '@/db/prisma.product';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new UploadThingError('Unauthorized');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      // first check how many products the user has uploaded
      const products = await prisma.product.count({
        where: { userId: metadata.userId },
      });
      if (products >= 5) {
        throw new UploadThingError(
          'You have reached the maximum number of products.'
        );
      }

      const newProduct = await createProduct({
        images: [file.url],
        description: 'Test description',
        name: 'Test name',
        price: 100,
        url: file.url,
        user: {
          connect: {
            id: metadata.userId,
          },
        },
      });

      if (!newProduct) {
        throw new UploadThingError('Error creating product');
      }
      const productinfo = {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        url: newProduct.url,
        status: newProduct.status,
      };
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
        productinfo,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
