import { Loader2 } from 'lucide-react';
import React from 'react';

export default function Loader() {
  return (
    <div>
      <Loader2 className='animate-spin h-12 w-12' />
    </div>
  );
}
