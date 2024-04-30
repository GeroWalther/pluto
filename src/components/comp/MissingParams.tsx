import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';

const MissingParams = () => {
  return (
    <MaxWidthWrapper>
      <div className='flex justify-center items-center h-96'>
        <h1 className='text-4xl font-bold text-center text-red-400'>
          Something went wrong. Missing required parameters!
        </h1>
        <Link
          href={`mailto:${process.env.SUPPORT_EMAIL}`}
          className='ml-8 text-lg font-medium caption-top text-dark underline underline-offset-8 md:text-base'>
          Contact Support
        </Link>
      </div>
    </MaxWidthWrapper>
  );
};

export default MissingParams;
