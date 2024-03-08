import { buttonVariants } from "@/components/ui/button";
import prisma from "@/db/db";
import { hash } from "bcryptjs";
import { XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Page({ params }: { params: { token: string } }) {
  const token = params.token;

  const user = await prisma.user.findUnique({
    where: {
      token: token,
    },
  });

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <XCircle className="h-6 w-8 text-red-700" />
        <h3 className=" font-semibold text-xl">There was a problem</h3>
        <p className=" text-muted-foreground text-sm text-center">
          This token is not valid or might be expired. <br /> Please try again.
        </p>
      </div>
    );
  }

  const newPassword = await hash(user.password, 10);

  const updateUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      token: "null",
      isEmailVerified: true,
      password: newPassword,
    },
  });

  if (!updateUser) {
    return (
      <div className="flex flex-col items-center gap-2">
        <XCircle className="h-6 w-8 text-red-700" />
        <h3 className=" font-semibold text-xl">There was a problem</h3>
        <p className=" text-muted-foreground text-sm text-center">
          There was a problem updating your account. <br /> Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className=" flex h-full flex-col items-center justify-center">
      <div className=" required: mb-4 h-60 w-60 text-muted-foreground">
        {/* <Image src="/emptyCart.png" fill alt="the email was veryfied" /> */}
      </div>

      <h3 className=" font-semibold text-2xl">You&apos;re all set!</h3>
      <p className=" text-muted-foreground text-center mt-1">
        Thank you for verifying your email.
      </p>
      <Link className={buttonVariants({ className: "mt-4" })} href="/sign-in">
        Sign in
      </Link>
    </div>
  );
}
