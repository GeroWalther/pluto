import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import Image from "next/image";
import { toast } from "sonner";
import { json } from "stream/consumers";
import { useMediaQuery } from "usehooks-ts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export default function UploadDrawerDialog() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Upload a product for sale</Button>
        </DialogTrigger>
        <DialogContent className="w-full overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>Product listing</DialogTitle>
            <DialogDescription>
              List a product for sale by filling out this form. (Once our team
              approves your upload, it will be listed for sale.)
            </DialogDescription>
          </DialogHeader>
          <UploadForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Upload a product for sale</Button>
      </DrawerTrigger>
      <DrawerContent className="w-full overflow-y-scroll max-h-screen">
        <DrawerHeader className="text-left">
          <DrawerTitle>Product listing</DrawerTitle>
          <DrawerDescription>
            List a product for sale by filing out this form.
          </DrawerDescription>
        </DrawerHeader>
        <UploadForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function UploadForm({ className }: React.ComponentProps<"form">) {
  const [urls, setUrls] = useState<string[]>([]);
  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const [fileDesc, setfileDesc] = useState({});
  const { mutate } = trpc.seller.deleteAllUploadedFiles.useMutation({
    onSuccess: (data) => {
      setUrls([]);
      setFileKeys([]);
      toast.success(data);
    },
    onError: () => {
      toast.error("Error deleting file");
    },
  });

  return (
    <form className={cn("grid items-start gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="name">Product name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          onChange={(e) =>
            setfileDesc((prevState) => ({ ...prevState, name: e.target.value }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          name="price"
          onChange={(e) =>
            setfileDesc((prevState) => ({
              ...prevState,
              price: e.target.value,
            }))
          }
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          onChange={(e) =>
            setfileDesc((prevState) => ({
              ...prevState,
              description: e.target.value,
            }))
          }
        />
      </div>

      {urls.length >= 0 && urls?.[0] ? (
        <div className="mb-10">
          <img src={urls?.[0]} alt="uploaded image" />
          <Button
            className={buttonVariants({
              variant: "destructive",
            })}
            onClick={() => mutate(fileKeys)}
          >
            Delete image
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm font-semi-bold">Upload one product image</p>
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              setUrls(res.map((r) => r.url));
              setFileKeys(res.map((r) => r.key));
              toast.success("uploaded successfully");
            }}
            headers={{
              body: JSON.stringify(fileDesc),
            }}
            onBeforeUploadBegin={(files) => {
              return files;
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
          <UploadButton
            endpoint="someThingElse"
            headers={{
              body: JSON.stringify(fileDesc),
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </>
      )}
    </form>
  );
}
