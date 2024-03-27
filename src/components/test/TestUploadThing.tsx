"use client";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import ImageSlider from "../comp/ImageSlider";
import { Button } from "../ui/button";

export default function TestUploadThing() {
  const [urls, setUrls] = useState<string[]>([]);
  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const [showFn, setShowFn] = useState(false);

  const { mutate: deleteAll } = trpc.seller.deleteAllUploadedFiles.useMutation({
    onSuccess: (data) => {
      setUrls([]);
      setFileKeys([]);
      toast.success(data);
    },
    onError: () => {
      toast.error("Error deleting file");
    },
  });
  console.log(urls.length);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      Upload one image
      {/*a form for Product name and description and price */}
      <UploadDropzone
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          setUrls(res.map((r) => r.url));
          setFileKeys(res.map((r) => r.key));
        }}
        onUploadError={(error) => {
          toast.error(error.message);
        }}
      />
      {showFn && (
        <div>
          <ImageSlider urls={urls} />
          <Button onClick={() => deleteAll(fileKeys)}>Delete all</Button>
        </div>
      )}
    </div>
  );
}
