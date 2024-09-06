'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function ProdFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeFilter = searchParams.get('category') ?? 'all';

  function handleFilter(filter: any) {
    const params = new URLSearchParams(searchParams);
    // builds the query string
    params.set('category', filter);

    //place the query string in the URL
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }
  return (
    <div className='border border-primary-800 flex'>
      <Button
        filter='all'
        handleFilter={handleFilter}
        activeFilter={activeFilter}>
        All
      </Button>
      <Button
        filter='Ebook'
        handleFilter={handleFilter}
        activeFilter={activeFilter}>
        E-Books
      </Button>
      <Button
        filter='Icons'
        handleFilter={handleFilter}
        activeFilter={activeFilter}>
        Icons
      </Button>
      <Button
        filter='Image'
        handleFilter={handleFilter}
        activeFilter={activeFilter}>
        Imaged
      </Button>
      <Button
        filter='UiUx'
        handleFilter={handleFilter}
        activeFilter={activeFilter}>
        UI/UX
      </Button>
      <Button
        filter='Font'
        handleFilter={handleFilter}
        activeFilter={activeFilter}>
        Fonts
      </Button>
    </div>
  );
}

import { ReactNode } from 'react';

function Button({
  children,
  filter,
  handleFilter,
  activeFilter,
}: {
  children: ReactNode;
  filter: string;
  handleFilter: (filter: string) => void;
  activeFilter: string;
}) {
  return (
    <button
      className={`px-5 py-2 hover:bg-stone-200 ${
        filter === activeFilter ? 'bg-stone-200 text-primary-50' : ''
      }`}
      onClick={() => handleFilter(filter)}>
      {children}
    </button>
  );
}
export default ProdFilter;
