import { useState } from 'react';

import { useMediaQuery } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import UploadForm from './UploadForm';

export default function UploadDrawerDialog() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant='outline'>Upload a product for sale</Button>
        </DialogTrigger>
        <DialogContent className='w-full overflow-y-scroll max-h-screen'>
          <DialogHeader>
            <DialogTitle>Product listing</DialogTitle>
            <DialogDescription>
              List a product for sale by filling out this form. (Once our team
              approves your upload, it will be listed for sale.)
            </DialogDescription>
          </DialogHeader>
          <UploadForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant='outline'>Upload a product for sale</Button>
      </DrawerTrigger>
      <DrawerContent className='w-full overflow-y-scroll max-h-screen'>
        <DrawerHeader className='text-left'>
          <DrawerTitle>Product listing</DrawerTitle>
          <DrawerDescription>
            List a product for sale by filing out this form.
          </DrawerDescription>
        </DrawerHeader>
        <UploadForm className='px-4' />
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
