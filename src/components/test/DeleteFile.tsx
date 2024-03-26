"use client";
import { trpc } from "@/trpc/client";
import { FC } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface DeleteFileProps {
  fileName: string;
  setRefreshed: (refreshed: boolean) => void;
}

const DeleteFileButton: FC<DeleteFileProps> = ({ fileName, setRefreshed }) => {
  const { mutate, data } = trpc.seller.deleteSellerProduct.useMutation();

  const deleteImage = () => {
    try {
      mutate(fileName);
      toast.success(data);
      setRefreshed(true);
    } catch (error) {
      toast.error("Error deleting file");
    }
  };
  return <Button onClick={deleteImage}>Delete</Button>;
};

export default DeleteFileButton;
