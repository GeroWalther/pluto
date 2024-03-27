'use client';
import { trpc } from '@/trpc/client';
import { FC } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface DeleteFileProps {
  fileName: string;
  setRefreshed: (refreshed: boolean) => void;
}

const DeleteUploadFileBtn: FC<DeleteFileProps> = ({
  fileName,
  setRefreshed,
}) => {
  const { mutate } = trpc.seller.deleteUploadFile.useMutation({
    onSuccess: (data) => {
      toast.success(data);
      setRefreshed(true);
    },
    onError: () => {
      toast.error('Error deleting file');
    },
  });

  return <Button onClick={() => mutate(fileName)}>Delete all</Button>;
};

export default DeleteUploadFileBtn;
