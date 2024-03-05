"use client";

import { cn } from "@/lib/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ZodError } from "zod";

import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from "@/lib/validators/account-credentials-validator";
//import { trpc } from '@/trpc/client';
import { PlutoLogo } from "@/components/svgs/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  });
  const router = useRouter();
  // const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
  //   onError: (err) => {
  //     if (err.data?.code === 'CONFLICT') {
  //       toast.error('This email is already in use. Sign in instead?');
  //       return;
  //     }

  //     if (err instanceof ZodError) {
  //       toast.error(err.issues[0].message);
  //       return;
  //     }
  //     toast.error('Something went wrong. Please try again.');
  //   },
  //   onSuccess: ({ sentToEmail }) => {
  //     toast.success(`Verification email sent to ${sentToEmail}.`);
  //     router.push('/verify-email?to=' + sentToEmail);
  //   },
  // });

  const onSubmit = async ({ email, password }: TAuthCredentialsValidator) => {
    // mutate({ email, password });

    try {
      const user = await fetch("/api/user/sign-up", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "content-type": "application/json",
        },
      });
      if (user.ok) {
        const u = await user.json();
        toast.success("Signed up successfully.");

        // router.push("/verify-email");
      } else {
        toast.error("This email is already in use. Sign in instead?");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <PlutoLogo className="h-32 w-32" />
            <h1 className="text-2xl font-bold">Create an account</h1>

            <Link
              className={buttonVariants({
                variant: "link",
                className: "text-blue-600",
              })}
              href="/sign-in"
            >
              Already have an account? Sign in &rarr;
            </Link>
          </div>

          <div className="grid gap-6 pb-16">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-2 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                    placeholder="you@example.com"
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2 py-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password,
                    })}
                    placeholder="Password"
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button>Sign up</Button>
              </div>
            </form>

            <Separator />
            {/* TODO: Add google button from https://next-auth.js.org/providers/google */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
