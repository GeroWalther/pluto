"use client";
import Loader from "@/components/Loader/Loader";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  FileInput,
  MoreVertical,
  PictureInPicture2Icon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import DeleteDialog from "./Dialogs/DeleteDialog";

export interface ProductType {
  status: "APPROVED" | "PENDING" | "REJECTED";
  name: string;
  description: string;
  userId: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  price: number;
  imageKeys: string[];
  imageUrls: string[];
  productFileUrls: string[];
  productFileKeys: string[];
  category: string;
}

interface propType {
  data: ProductType[] | undefined;
  isError?: boolean;
  isLoading?: boolean;
  update?: boolean;
  seller?: boolean;
}

export default function AdminTable({
  data,
  isError,
  isLoading,
  update = false,
  seller = false,
}: propType) {
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const q = useQueryClient();
  const { mutate } = trpc.admin.updatePendingProducts.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      q.invalidateQueries();
    },
    onError: (err: any) => {
      toast.error(err.message);
      console.log(err);
    },
  });
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  if (data?.length === 0) {
    return (
      <div>
        <p className="text-stone-400">No products left.</p>
      </div>
    );
  }
  if (isError)
    return (
      <div>
        <p className="text-red-400">Something went wrong...</p>
      </div>
    );
  if (seller)
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      p.status === "APPROVED"
                        ? "bg-green-500"
                        : p.status === "PENDING"
                        ? "bg-stone-400"
                        : "bg-red-600",
                      "p-2 text-stone-50 rounded-full text-[10px]"
                    )}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell>${p.price}</TableCell>
                {p.imageUrls[0] ? (
                  <TableCell className="text-right">
                    <Image
                      className="h-12 w-12 object-cover"
                      src={p.imageUrls[0]}
                      alt={p.name}
                      width={50}
                      height={50}
                    />
                  </TableCell>
                ) : (
                  <TableCell className="text-right">
                    <Image height={50} width={50} src="/eis.jpg" alt={p.name} />
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className=" ml-auto h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <button
                          onClick={() => {
                            setOpenDeleteModal(true);
                            setDeleteId(p.id);
                          }}
                          className="flex justify-between items-center w-full"
                        >
                          <span className="text-red-500 font-semibold ">
                            Delete
                          </span>
                          <Trash2 color="red" className="h-4 w-4" />
                        </button>
                      </DropdownMenuItem>
                      {/* <DropdownMenuSeparator />
              <DropdownMenuItem
                className='bg-red flex justify-between items-center'
                onClick={() => {
                  alert('Clñickkced!!');
                }}>
                <span className='text-stone-600 font-semibold '>
                  Edit
                </span>
                <Pen color='blue' className='h-4 w-4' />
              </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <DeleteDialog
            open={openDeleteModal}
            setOpen={setOpenDeleteModal}
            deleteId={deleteId}
            setDeleteId={setDeleteId}
          />
        </Table>
      </div>
    );

  return (
    <Table className="m-2">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Submitted at</TableHead>
          <TableHead>File</TableHead>
          <TableHead>Image(s)</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          {update ? <TableHead>Status</TableHead> : <TableHead></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          Array.isArray(data) &&
          data.map((p: ProductType) => (
            <TableRow key={p.id}>
              <TableCell className="text-left">{p.name}</TableCell>

              <TableCell className="text-left">
                {format(new Date(p.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>

              <TableCell className="text-left">
                {p.productFileUrls.map((file: string, index: number) => (
                  <ul key={index} className="mb-3">
                    <li>
                      <a href={file} download>
                        <FileInput />
                      </a>
                    </li>
                  </ul>
                ))}
              </TableCell>
              <TableCell className="text-left">
                {p.imageUrls.map((file: string, index: number) => (
                  <ul key={index} className="mb-3">
                    <li>
                      <a href={file} download>
                        <PictureInPicture2Icon />
                      </a>
                    </li>
                  </ul>
                ))}
              </TableCell>
              <TableCell className="text-left">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setOpenDescriptionModal(true)}
                    >
                      See Description
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Product Description</DialogTitle>
                      <DialogDescription>
                        The description that has been uploaded by the seller.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-stone-200 rounded-sm">
                      <p>{p.description}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>

              <TableCell className="text-left">${p.price}</TableCell>

              <TableCell className="text-left flex gap-2">
                {update ? (
                  <>
                    <Button
                      className="bg-green-600  text-stone-100"
                      onClick={() => {
                        console.log({ id: p.id, updateString: "APPROVED" });
                        mutate({ id: p.id, updateString: "APPROVED" });
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      className="bg-red-600  text-stone-100"
                      onClick={() =>
                        mutate({ id: p.id, updateString: "REJECTED" })
                      }
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-red-600 py-1 px-3"
                    onClick={() => {
                      setOpenDeleteModal(true);
                      setDeleteId(p.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-stone-100" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
      <DeleteDialog
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
      />
    </Table>
  );
}
