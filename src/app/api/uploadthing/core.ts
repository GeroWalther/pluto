import prisma from "@/db/db";
import { createProduct } from "@/db/prisma.product";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

type formDesc = {
  name: string;
  price: string;
  description: string;
};

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session) throw new UploadThingError("Unauthorized");

      const headers = req.headers;
      const body = headers.get("body"); // Accessing the 'body' from the headers
      if (!body) throw new UploadThingError("Missing body");
      const fileDesc = JSON.parse(body) as formDesc;

      if (!fileDesc.name) throw new UploadThingError("Missing name");
      if (!fileDesc.price) throw new UploadThingError("Missing price");
      if (!fileDesc.description)
        throw new UploadThingError("Missing description");

      const products = await prisma.product.count({
        where: { userId: session.user.id },
      });

      if (products >= 5) {
        throw new UploadThingError(
          "You have reached the maximum number of products."
        );
      }

      // return metadata to be used in onUploadComlete
      return { userId: session.user.id, fileDesc };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload

      const newProduct = await createProduct({
        images: [file.url],
        description: metadata.fileDesc.description,
        name: metadata.fileDesc.name,
        price: parseInt(metadata.fileDesc.price),
        url: [file.url],
        user: {
          connect: {
            id: metadata.userId,
          },
        },
      });

      if (!newProduct) {
        throw new UploadThingError("Error creating product");
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

  someThingElse: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const headers = req.headers;
      const body = headers.get("body"); // Accessing the 'body' from the headers
      if (!body) throw new UploadThingError("Missing body");
      const fileDesc = JSON.parse(body) as formDesc;

      if (!fileDesc.name) throw new UploadThingError("Missing name");
      if (!fileDesc.price) throw new UploadThingError("Missing price");
      if (!fileDesc.description)
        throw new UploadThingError("Missing description");

      if (req) throw new UploadThingError("Not implemented");

      return {
        userId: "xxx",
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
