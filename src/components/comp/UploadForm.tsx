"use client";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "../ui/button";

const schema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
});

type FormFields = z.infer<typeof schema>;

export default function UploadForm() {
  const [urls, setUrls] = useState<string[]>([]);
  const [fileKeys, setFileKeys] = useState<string[]>([]);

  const { mutate: onDelete } = trpc.seller.deleteUploadedFile.useMutation({
    onSuccess: (data) => {
      setUrls([]);
      setFileKeys([]);
      toast.success(data);
    },
    onError: () => {
      toast.error("Error deleting file");
    },
  });

  const { mutate: uploadProduct } = trpc.seller.uploadProduct.useMutation({
    onError: (err) => {
      toast.error("Something went wrong. Please try again.");
    },
    onSuccess: () => {
      toast.success("Product uploaded successfully");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormFields) => {
    uploadProduct({
      name: data.name,
      price: data.price,
      description: data.description,
      imageUrl: urls,
    });
  };

  const deleteImage = () => {
    onDelete(fileKeys);
  };

  return (
    <form className="grid items-start gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label htmlFor="productName">Product name</label>
        <input type="text" id="productName" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <label htmlFor="price">Price</label>
        <input type="number" id="price" {...register("price")} />
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>
      {/* Add other form fields here */}
      <div className="grid gap-2">
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {urls.length > 0 ? (
        <>
          <img src={urls[0]} alt="product" className="w-32 h-32" />
          <Button variant="destructive" onClick={deleteImage}>
            Delete
          </Button>
        </>
      ) : (
        <UploadDropzone
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            setUrls(res.map((r) => r.url));
            setFileKeys(res.map((r) => r.key));
            console.log(res);
            toast.success("uploaded successfully");
          }}
          onUploadError={(error) => {
            toast.error(error.message);
          }}
        />
      )}

      <button
        type="submit"
        className={buttonVariants({
          variant: "default",
          size: "lg",
        })}
      >
        Submit
      </button>
    </form>
  );
}
