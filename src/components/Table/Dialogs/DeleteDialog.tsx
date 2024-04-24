import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/trpc/client';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

export default function DeleteDialog({
  open,
  setOpen,
  deleteId,
  setDeleteId,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteId: string;
  setDeleteId: React.Dispatch<React.SetStateAction<string>>;
}) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='w-full overflow-y-scroll max-h-screen'>
        <DialogHeader>
          <DialogTitle className='font-bold text-red-500'>
            Product deletion
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='font-semibold text-stone-700'>
          <p>Do you really want to delete this product from your inventory?</p>
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
  );
}
