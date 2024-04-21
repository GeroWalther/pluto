import { cn } from "@/lib/utils";
import { serverCaller } from "@/trpc";
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
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default async function Admindashboard() {
  const data = await serverCaller.admin.getPendingProducts();
  return (
    <div>
      <h3>AdimDash</h3>
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">
            Pending Requests
          </h4>
          {/* {pendingProducts.map((tag) => ( */}
          <>
            <div className="text-sm">
              <Table>
                <TableHeader>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableHeader>
                <TableBody>
                  {data &&
                    data.map((p) => (
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
                        <TableCell>{p.price}</TableCell>
                        {p.imageUrls[0] && (
                          <TableCell className="text-right">
                            <ImageSlider
                              urls={p.imageUrls}
                              alt={`${p.name}'s product image`}
                            />
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className=" ml-auto h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                {/* <button
                        onClick={() => {
                          // setOpen(true);
                          // setDeleteId(p.id);
                        }}
                        className="flex justify-between items-center w-full"
                      >
                        <span className="text-red-500 font-semibold ">
                          Approve
                        </span>
                        <Trash2 color="red" className="h-4 w-4" />
                      </button> */}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {/* <DropdownMenuItem
                                className="bg-red flex justify-between items-center"
                                onClick={() => {
                                  alert("Clñickkced!!");
                                }}
                              >
                                <span className="text-stone-600 font-semibold ">
                                  Reject
                                </span>
                                <Pen color="blue" className="h-4 w-4" />
                              </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <Separator className="my-2" />
          </>
          {/* ))} */}
        </div>
      </ScrollArea>
    </div>
  );
}

// function PendingProdTble () {

//   return (

//   );
// }
