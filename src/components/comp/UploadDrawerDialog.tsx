import { useState } from 'react';

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
import { useMediaQuery } from 'usehooks-ts';

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
  // const isDesktop = useMediaQuery('(min-width: 768px)');

  //if (isDesktop) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='default'>Upload a product for sale</Button>
      </DialogTrigger>
      <DialogContent className='w-full overflow-y-scroll max-h-screen'>
        <DialogHeader>
          <DialogTitle className='font-bold text-stone-800'>
            Product listing
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='font-semibold text-stone-700'>
          List a product for sale by filling out this form. <br />
          <span className='font-semibold text-muted-foreground'>
            (Once our team approves your upload, it will be listed for sale.)
          </span>
        </DialogDescription>
        <UploadForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
  // }

  // return (
  //   <Drawer open={open} onOpenChange={setOpen}>
  //     <DrawerTrigger asChild>
  //       <Button variant='default'>Upload a product for sale</Button>
  //     </DrawerTrigger>
  //     <DrawerContent className='w-full overflow-y-scroll max-h-screen'>
  //       <DrawerHeader className='text-left'>
  //         <DrawerTitle className='font-bold text-stone-800'>
  //           Product listing
  //         </DrawerTitle>
  //         <DrawerDescription className='font-semibold text-stone-700'>
  //           List a product for sale by filing out this form. <br />
  //           <span className='font-semibold text-muted-foreground'>
  //             (Once our team approves your upload, it will be listed for sale.)
  //           </span>
  //         </DrawerDescription>
  //         <UploadForm setOpen={setOpen} />
  //       </DrawerHeader>
  //       <DrawerFooter className='pt-2'>
  //         <DrawerClose asChild>
  //           <Button variant='outline'>Cancel</Button>
  //         </DrawerClose>
  //       </DrawerFooter>
  //     </DrawerContent>
  //   </Drawer>
  // );
}
