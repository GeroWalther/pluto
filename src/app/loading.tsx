import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className='container flex pt-20 flex-col items-center justify-center lg:px-0 gap-5'>
      <Loader2 size={50} className='text-stone-400 animate-spin ' />
      <p className='text-muted-foreground text-sm'>
        Loading, please wait. This should not take too long...
      </p>
    </div>
  );
}
