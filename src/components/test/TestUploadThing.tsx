"use client";
import { UploadDropzone } from "@/lib/uploadthing";
import { useEffect, useState } from "react";
import DeleteFileButton from "./DeleteFile";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [fileKey, setFileKey] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setUrl("");
    setFileKey("");
    setRefresh(false);
  }, [refresh]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2">
      <UploadDropzone
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          setUrl(res?.[0]?.url);
          setFileKey(res?.[0]?.key);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      {url && <img src={url} width={200} height={200} alt="uploaded image" />}
      {url && <DeleteFileButton fileName={fileKey} setRefreshed={setRefresh} />}
    </div>
  );
}
