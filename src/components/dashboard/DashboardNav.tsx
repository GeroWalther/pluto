'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Package, Receipt, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', label: 'Overview', Icon: BarChart3 },
  { href: '/dashboard/products', label: 'My products', Icon: Package },
  { href: '/dashboard/sales', label: 'Sales', Icon: Receipt },
  { href: '/dashboard/payouts', label: 'Payouts', Icon: Wallet },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className='flex gap-1 overflow-x-auto border-b border-stone-200'>
      {tabs.map((tab) => {
        const active =
          tab.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              active
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-900'
            )}>
            <tab.Icon className='h-4 w-4' />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
