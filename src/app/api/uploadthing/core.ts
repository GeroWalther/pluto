import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import {
  createProduct,
  getProductByFileName,
  updateProduct,
} from '@/db/prisma.product';
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

      // first check if product already exists if not create new one if it exists update existing.
      const productExists = await getProductByFileName(file.name);

      if (!productExists) {
        const uploadProduct = await createProduct({
          images: [file.name],
          name: 'name',
          url: file.url,
          description: 'description',
          price: 1000,
          user: {
            connect: {
              id: metadata.userId,
            },
          },
        });

        if (!uploadProduct) {
          console.error('Failed to upload product');
          throw new UploadThingError('Failed to upload product');
        }
        return {
          uploadedBy: metadata.userId,
          productId: uploadProduct.id,
          url: file.url,
        };
      }
      const updatedProduct = await updateProduct(productExists.id, {
        images: [...productExists.images, file.name],
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
        productId: updatedProduct.id,
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
