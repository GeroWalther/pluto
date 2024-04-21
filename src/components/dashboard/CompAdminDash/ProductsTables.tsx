'use client';
import { trpc } from '@/trpc/client';
import React, { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Button } from '../../ui/button';
import { FileInput, PictureInPicture2Icon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { format } from 'date-fns';

export default function Admindashboard() {
  const [open, setOpen] = useState(false);
  const { data, isError, isLoading } = trpc.admin.getPendingProducts.useQuery();
  const q = useQueryClient();
  const { mutate } = trpc.admin.updatePendingProducts.useMutation({
    onSuccess: () => {
      toast.success('Product updated successfully!');
      q.invalidateQueries();
    },
    onError: (err: any) => {
      toast.error(err.message);
      console.log(err);
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || data == undefined) return <div>Error</div>;

  return (
    <Table className='m-2'>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Submitted at</TableHead>
          <TableHead>File</TableHead>
          <TableHead>Image(s)</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((p) => (
          <TableRow key={p.id}>
            <TableCell className='text-left'>{p.name}</TableCell>

            <TableCell className='text-left'>
              {format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm:ss')}
            </TableCell>

            <TableCell className='text-left'>
              {p.productFileUrls.map((file, index) => (
                <ul key={index} className='mb-3'>
                  <li>
                    <a href={file} download>
                      <FileInput />
                    </a>
                  </li>
                </ul>
              ))}
            </TableCell>
            <TableCell className='text-left'>
              {p.imageUrls.map((file, index) => (
                <ul key={index} className='mb-3'>
                  <li>
                    <a href={file} download>
                      <PictureInPicture2Icon />
                    </a>
                  </li>
                </ul>
              ))}
            </TableCell>
            <TableCell className='text-left'>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' onClick={() => setOpen(true)}>
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
                  <div className='p-4 bg-stone-200 rounded-sm'>
                    <p>{p.description}</p>
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>

            <TableCell className='text-left'>${p.price}</TableCell>

            <TableCell className='text-left flex gap-2'>
              <Button
                className='bg-green-500'
                onClick={() => mutate({ id: p.id, updateString: 'APPROVED' })}>
                Approve
              </Button>
              <Button
                className='bg-red-500'
                onClick={() => mutate({ id: p.id, updateString: 'REJECTED' })}>
                Reject
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
