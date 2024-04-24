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
} from '../ui/table';
import { Button } from '../ui/button';
import { FileInput, PictureInPicture2Icon, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { format } from 'date-fns';
import Loader from '@/components/Loader/Loader';
import DeleteDialog from './Dialogs/DeleteDialog';

export interface dataType {
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
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
}

interface propType {
  data: dataType[] | undefined;
  isError: boolean;
  isLoading: boolean;
  update?: boolean;
}

export default function AdminTable({
  data,
  isError,
  isLoading,
  update = false,
}: propType) {
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState('');
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

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-full'>
        <Loader />
      </div>
    );
  if (isError)
    return (
      <div>
        <p className='text-red-400'>Something went wrong...</p>
      </div>
    );

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
          {update ? <TableHead>Status</TableHead> : <TableHead></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          Array.isArray(data) &&
          data.map((p: dataType) => (
            <TableRow key={p.id}>
              <TableCell className='text-left'>{p.name}</TableCell>

              <TableCell className='text-left'>
                {format(new Date(p.createdAt), 'yyyy-MM-dd HH:mm:ss')}
              </TableCell>

              <TableCell className='text-left'>
                {p.productFileUrls.map((file: string, index: number) => (
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
                {p.imageUrls.map((file: string, index: number) => (
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
                    <Button
                      variant='outline'
                      onClick={() => setOpenDescriptionModal(true)}>
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
                {update ? (
                  <>
                    <Button
                      className='bg-green-600  text-stone-100'
                      onClick={() => {
                        console.log({ id: p.id, updateString: 'APPROVED' });
                        mutate({ id: p.id, updateString: 'APPROVED' });
                      }}>
                      Approve
                    </Button>
                    <Button
                      className='bg-red-600  text-stone-100'
                      onClick={() =>
                        mutate({ id: p.id, updateString: 'REJECTED' })
                      }>
                      Reject
                    </Button>
                  </>
                ) : (
                  <Button
                    className='bg-red-600 py-1 px-3'
                    onClick={() => {
                      setOpenDeleteModal(true);
                      setDeleteId(p.id);
                    }}>
                    <Trash2 className='w-4 h-4 text-stone-100' />
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
