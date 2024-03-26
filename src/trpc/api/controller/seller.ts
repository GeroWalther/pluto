import { TRPCError } from "@trpc/server";
import type { User } from "next-auth";
import { use } from "react";
import { UTApi } from "uploadthing/server";

export const deleteSellerProduct = async (input: string, user: User) => {
  const utapi = new UTApi();
  const deleted = await utapi.deleteFiles(input);

  const { id } = user;
  // remove the file from the database

  if (!deleted) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "File not found",
    });
  }

  return "File deleted";
};
