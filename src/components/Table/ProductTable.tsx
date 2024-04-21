// 'use client';

import { trpc } from '@/trpc/client';
import { MoreVertical, Pen, Trash2 } from 'lucide-react';

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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
  productFileUrls: string[];
  productFileKeys: string[];
}

const ProductTable = ({ data }: { data: colType[] | undefined }) => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const queryClient = useQueryClient();

  const { mutate: deleteProductInDB } = trpc.seller.deleteProduct.useMutation({
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
              <TableCell>${p.price}</TableCell>
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
                deleteProductInDB(deleteId);
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

export default ProductTable;
