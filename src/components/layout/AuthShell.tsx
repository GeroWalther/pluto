import Link from 'next/link';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-sm'>
        <div className='text-center'>
          <Link href='/' className='text-xl font-bold tracking-tight'>
            Pluto<span className='text-indigo-600'>Market</span>
          </Link>
          <h1 className='mt-6 text-2xl font-bold tracking-tight text-stone-900'>
            {title}
          </h1>
          {subtitle ? (
            <p className='mt-2 text-sm text-muted-foreground'>{subtitle}</p>
          ) : null}
        </div>

        <div className='mt-8'>{children}</div>

        {footer ? (
          <div className='mt-6 text-center text-sm text-muted-foreground'>{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
