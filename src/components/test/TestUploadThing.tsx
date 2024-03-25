"use client";
import { UploadButton } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import "@uploadthing/react/styles.css";
import Image from "next/image";
import { useState } from "react";
import { buttonVariants } from "../ui/button";
export default function Home() {
  const [url, setUrl] = useState<string>("");
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          setUrl(res[0].url);
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
        className={buttonVariants({
          variant: "default",
          size: "lg",
        })}
      />

      <img src={url} width={200} height={200} alt="test" />
    </div>
  );
}
