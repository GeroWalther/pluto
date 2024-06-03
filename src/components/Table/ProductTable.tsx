// 'use client';

import { MoreVertical, Pen, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";
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

import { useState } from "react";
import DeleteDialog from "./Dialogs/DeleteDialog";

interface colType {
  name: string;
  id: string;
  price: number;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  userId: string;
  createdAt: string;
  updatedAt: string;
  imageKeys: string[];
  imageUrls: string[];
  productFileUrls: string[];
  productFileKeys: string[];
}

const ProductTable = ({ data }: { data: colType[] | undefined }) => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  return (
    <div>
      <Table>
        <TableHeader>
          <TableHead>Product Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Image</TableHead>
          <TableHead className="w-20"></TableHead>
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
                    className="h-10 w-10"
                    src={p.imageUrls[0]!}
                    alt={p.name}
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
                          setOpen(true);
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
          open={open}
          setOpen={setOpen}
          deleteId={deleteId}
          setDeleteId={setDeleteId}
        />
      </Table>
    </div>
  );
};

export default ProductTable;
