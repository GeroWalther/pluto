import MaxWidthWrapper from "./MaxWidthWrapper";

const MissingPerams = () => {
  return (
    <MaxWidthWrapper>
      <div className="flex justify-center items-center h-96">
        <h1 className="text-4xl font-bold text-center">
          Missing required parameters
        </h1>
      </div>
    </MaxWidthWrapper>
  );
};

export default MissingPerams;
