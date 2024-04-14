// 'use client';

import { trpc } from '@/trpc/client';
import {
  Delete,
  Loader2,
  MoreHorizontal,
  MoreVertical,
  Pen,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

// import {
//   ColumnDef,
//   ColumnFiltersState,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from '@tanstack/react-table';
// import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
// import * as React from 'react';

// import { Button } from '@/components/ui/button';

// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Input } from '@/components/ui/input';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { trpc } from '@/trpc/client';
// import { cn } from '@/lib/utils';

// export type colType =
//   | {
//       id: string;
//       price: number;
//       status: 'PENDING' | 'APPROVED' | 'REJECTED';
//       name: string;
//     }
//   | undefined;

// export const columns: ColumnDef<colType>[] = [
//   {
//     accessorKey: 'name',
//     header: ({ column }) => {
//       return (
//         <Button
//           variant='ghost'
//           onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
//           Product Name
//           <ArrowUpDown className='ml-2 h-4 w-4' />
//         </Button>
//       );
//     },
//     cell: ({ row }) => <div className='lowercase'>{row.getValue('name')}</div>,
//   },
//   {
//     accessorKey: 'status',
//     header: 'Status',
//     cell: ({ row }) => (
//       <div className='capitalize'>{row.getValue('status')}</div>
//     ),
//   },
//   {
//     accessorKey: 'price',
//     header: () => <div className='text-right'>Price</div>,
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue('price'));

//       // Format the amount as a dollar amount
//       const formatted = new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//       }).format(amount);

//       return <div className='text-right font-medium'>{formatted}</div>;
//     },
//   },
//   {
//     id: 'actions',
//     enableHiding: false,
//     cell: ({ row }) => {
//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant='ghost' className='h-8 w-8 p-0'>
//               <MoreHorizontal className='h-4 w-4' />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align='end'>
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem onClick={() => {}}>Delete</DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem>Edit</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];

// export function ProductTable({ data }: { data: any }) {
//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     []
//   );
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = React.useState({});

//   const { data: allProducts } = trpc.seller.getAllProducts.useQuery();

//   const table = useReactTable({
//     data,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   });

//   return (
//     <div className='w-full'>
//       <div className='flex items-center py-4'>
//         <Input
//           placeholder='Filter products...'
//           value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
//           onChange={(event) =>
//             table.getColumn('name')?.setFilterValue(event.target.value)
//           }
//           className='max-w-sm'
//         />
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant='outline' className='ml-auto'>
//               Select <ChevronDown className='ml-2 h-4 w-4' />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align='end'>
//             {table
//               .getAllColumns()
//               .filter((column) => column.getCanHide())
//               .map((column) => {
//                 return (
//                   <DropdownMenuCheckboxItem
//                     key={column.id}
//                     className='capitalize'
//                     checked={column.getIsVisible()}
//                     onCheckedChange={(value) =>
//                       column.toggleVisibility(!!value)
//                     }>
//                     {column.id}
//                   </DropdownMenuCheckboxItem>
//                 );
//               })}
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//       <div className='rounded-md border'>
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               allProducts?.map((p) => (
//                 <TableRow key={p.id}>
//                   <TableCell>{p.name}</TableCell>
//                   <TableCell>
//                     <span
//                       className={cn(
//                         p.status === 'APPROVED'
//                           ? 'bg-green-500'
//                           : p.status === 'PENDING'
//                           ? 'bg-stone-400'
//                           : 'bg-red-600',
//                         'p-2 text-stone-50 rounded-full text-[10px]'
//                       )}>
//                       {p.status}
//                     </span>
//                   </TableCell>
//                   <TableCell>{p.price}</TableCell>
//                   <TableCell>
//                     <img src={p.images[0]} alt={`${p.name} image`} />
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className='h-24 text-center'>
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       {/* <div className='flex items-center justify-end space-x-2 py-4'>
//         <div className='flex-1 text-sm text-muted-foreground'>
//           {table.getFilteredSelectedRowModel().rows.length} of{' '}
//           {table.getFilteredRowModel().rows.length} row(s) selected.
//         </div>
//         <div className='space-x-2'>
//           <Button
//             variant='outline'
//             size='sm'
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}>
//             Previous
//           </Button>
//           <Button
//             variant='outline'
//             size='sm'
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}>
//             Next
//           </Button>
//         </div>
//       </div> */}
//     </div>
//   );
// }

// const data = [
//   {
//     _id: 1,
//     name: 'TestProduct',
//     description: 'scdxzczxczxczxczxczxczxc',
//     price: 1223,
//     imageUrl: [
//       'https://utfs.io/f/8aa1f025-4110-4ce2-a477-d063cf5159cf-yd0xy2.PNG',
//     ],
//     status: 'PENDING',
//     createdAt: '2024-04-04T13:35:15.944+00:00',
//     updatedAt: '2024-04-04T13:35:15.944+00:00',
//     userId: '65f70c0de1451541ddd0d021',
//   },
//   {
//     _id: 2,
//     name: 'TestProduct',
//     description: 'scdxzczxczxczxczxczxczxc',
//     price: 1223,
//     imageUrl: [
//       'https://utfs.io/f/69ce5a2a-9b01-48e4-95b1-9bdc33c98295-yd0xy2.PNG',
//     ],
//     status: 'PENDING',
//     createdAt: '2024-04-04T13:42:57.956+00:00',
//     updatedAt: '2024-04-04T13:42:57.956+00:00',
//     userId: '65f70c0de1451541ddd0d021',
//   },
//   {
//     _id: 3,
//     name: 'TestProduct',
//     description: 'scdxzczxczxczxczxczxczxc',
//     price: 1223,
//     imageUrl: [
//       'https://utfs.io/f/69ce5a2a-9b01-48e4-95b1-9bdc33c98295-yd0xy2.PNG',
//     ],
//     status: 'PENDING',
//     createdAt: '2024-04-04T13:42:57.956+00:00',
//     updatedAt: '2024-04-04T13:42:57.956+00:00',
//     userId: '65f70c0de1451541ddd0d021',
//   },
// ];

interface colType {
  name: string;
  id: string;
  price: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  userId: string;
  createdAt: string;
  updatedAt: string;
  imageKeys: string[];
  imageUrls: string[];
  productFiles: string[];
}

const DataTable = ({ data }: { data: colType[] | undefined }) => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const queryClient = useQueryClient();
  const { mutate: mutateDelete } = trpc.seller.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success('Product deleted successfully!');
      setOpen(false);
      setDeleteId('');
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error('Error deleting product');
      console.error(error);
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableHead>Product Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Image</TableHead>
          <TableHead className='w-20'></TableHead>
        </TableHeader>
        <TableBody>
          {data?.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    p.status === 'APPROVED'
                      ? 'bg-green-500'
                      : p.status === 'PENDING'
                      ? 'bg-stone-400'
                      : 'bg-red-600',
                    'p-2 text-stone-50 rounded-full text-[10px]'
                  )}>
                  {p.status}
                </span>
              </TableCell>
              <TableCell>{p.price}</TableCell>
              {p.imageUrls[0] ? (
                <TableCell className='text-right'>
                  <img
                    className='h-10 w-10'
                    src={p.imageUrls[0]}
                    alt={p.name}
                  />
                </TableCell>
              ) : (
                <TableCell className='text-right'>
                  <Image height={50} width={50} src='/eis.jpg' alt={p.name} />
                </TableCell>
              )}
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className=' ml-auto h-8 w-8 p-0'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <button
                        onClick={() => {
                          setOpen(true);
                          setDeleteId(p.id);
                        }}
                        className='flex justify-between items-center w-full'>
                        <span className='text-red-500 font-semibold '>
                          Delete
                        </span>
                        <Trash2 color='red' className='h-4 w-4' />
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='bg-red flex justify-between items-center'
                      onClick={() => {
                        alert('Clñickkced!!');
                      }}>
                      <span className='text-stone-600 font-semibold '>
                        Edit
                      </span>
                      <Pen color='blue' className='h-4 w-4' />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='w-full overflow-y-scroll max-h-screen'>
            <DialogHeader>
              <DialogTitle className='font-bold text-red-500'>
                Product deletion
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className='font-semibold text-stone-700'>
              <p>
                Do you really want to delete this product from your inventory?
              </p>
            </DialogDescription>
            <Button
              variant='destructive'
              onClick={() => {
                alert('DELLETTE');
                mutateDelete(deleteId);
              }}>
              <span className='text-white font-semibold mr-2'>Delete</span>
              <Trash2 color='white' className='h-4 w-4' />
            </Button>
          </DialogContent>
        </Dialog>
      </Table>
    </div>
  );
};

export default DataTable;

{
  /* <DropdownMenuItem>
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild className='w-full'>
    <button className='flex justify-between items-center'>
      <span className='text-red-500 font-semibold '>
        Delete
      </span>
      <Trash2 color='red' className='h-4 w-4' />
    </button>
  </DialogTrigger>
  <DialogContent className='w-full overflow-y-scroll max-h-screen'>
    <DialogHeader>
      <DialogTitle className='font-bold text-red-500'>
        Product deletion
      </DialogTitle>
    </DialogHeader>
    <DialogDescription className='font-semibold text-stone-700'>
      <p>
        Do you really want to delete this product from
        your inventory?
      </p>
    </DialogDescription>
    <Button
      onClick={() => {
        alert('DELLETTE');
      }}>
      <span className='text-red-500 font-semibold '>
        Delete
      </span>
      <Trash2 color='red' className='h-4 w-4' />
    </Button>
  </DialogContent>
</Dialog>
</DropdownMenuItem> */
}
