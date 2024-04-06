// 'use client';

import { MoreVertical } from 'lucide-react';
import { Tdata } from '../dashboard/SellerDashboard';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';

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
interface TableProps {
  data: Tdata;
}

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

const DataTable = ({ data }: TableProps) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>Product Name</TableRow>
          <TableRow>Status</TableRow>
          <TableRow>Price</TableRow>
          <TableRow>Image</TableRow>
          <TableRow className='w-20'></TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell>{p.price}</TableCell>

              <TableCell className='text-right'>
                {/* <img src={p.imageUrl[0]} /> */}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='secondary'
                  className='ml-auto flex h-8 w-8 p-0'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
