"use client";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { MoreVertical, Pen, Trash2 } from "lucide-react";
import React from "react";
import ImageSlider from "../comp/ImageSlider";
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

export default function Admindashboard() {
  const { data, isError, isLoading } = trpc.admin.getPendingProducts.useQuery();
  const { mutate } = trpc.admin.updatePendingProducts.useMutation();
  if (isLoading) return <div>Loading...</div>;
  if (isError || data == undefined) return <div>Error</div>;

  const handleUpdate = (id: string, updateString: string) => {
    mutate({
      id,
      updateString: updateString,
    });
  };
  return (
    <Table className="text-right">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.id}</TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="font-medium">
              <select
                onChange={(e) => handleUpdate(product.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </TableCell>
            <TableCell className="font-medium">{product.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
