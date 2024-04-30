import Link from 'next/link';
import MaxWidthWrapper from './MaxWidthWrapper';

const MissingPerams = () => {
  return (
    <MaxWidthWrapper>
      <div className='flex-col justify-center items-center h-96 mt-10 '>
        <h1 className='text-3xl font-bold text-center text-red-500'>
          Something went wrong. <br />
          Missing required parameters!
        </h1>
        <p className='mt-4 text-lg text-center text-muted-foreground'>
          Please contact support for further assistance. Tell us this url, your
          name etc.
        </p>
        <div className='flex mt-4 justify-center items-center'>
          <Link
            href={`mailto:${process.env.SUPPORT_EMAIL}`}
            className='text-lg font-medium caption-top text-dark underline underline-offset-8 md:text-base'>
            Contact Support
          </Link>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default MissingPerams;
