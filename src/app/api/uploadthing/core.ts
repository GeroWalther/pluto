import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/lib/auth';

const f = createUploadthing();

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new UploadThingError('You must be signed in to upload.');
  return { userId: session.user.id };
}

export const ourFileRouter = {
  /** Public preview images shown on the listing. */
  productImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 5 },
  })
    .middleware(requireUser)
    .onUploadComplete(({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      key: file.key,
      url: file.ufsUrl,
      name: file.name,
    })),

  /**
   * The deliverable. These blobs are never linked publicly — the URL is stored
   * server-side and only reachable through /api/download after purchase.
   */
  productFile: f({
    blob: { maxFileSize: '64MB', maxFileCount: 10 },
  })
    .middleware(requireUser)
    .onUploadComplete(({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      key: file.key,
      url: file.ufsUrl,
      name: file.name,
    })),

  /** Profile picture. */
  avatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(requireUser)
    .onUploadComplete(({ metadata, file }) => ({
      uploadedBy: metadata.userId,
      key: file.key,
      url: file.ufsUrl,
      name: file.name,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
