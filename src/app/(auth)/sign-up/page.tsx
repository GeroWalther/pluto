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

import { PlutoLogo } from "@/components/svgs/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

import GithubButton from "@/components/Btn/GithubButton";
import { GoogleButton } from "@/components/Btn/GoogleButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/trpc/client";
import { signIn } from "next-auth/react";
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

  const { mutate, isPending } = trpc.auth.signUp.useMutation({
    onError: (err) => {
      if (err.data) {
        toast.error(err.message);
        return;
      }
      if (err instanceof ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
      toast.error("Something went wrong. Please try again.");
    },
    onSuccess: ({ email }) => {
      router.push("/verify-email?to=" + email);
    },
  });

  async function githubSignup() {
    await signIn("github", { callbackUrl: "/" });
  }
  async function googleSignup() {
    await signIn("google", { callbackUrl: "/" });
  }

  const onSubmit = async ({
    name,
    email,
    password,
    confirm_password,
  }: TAuthCredentialsValidator) => {
    await mutate({ email, password, name, confirm_password });

    // try {
    //   const user = await fetch("/api/user/sign-up", {
    //     method: "POST",
    //     body: JSON.stringify({ name, email, password, confirm_password }),
    //     headers: {
    //       "content-type": "application/json",
    //     },
    //   });
    //   if (user.ok) {
    //     const u = await user.json();
    //     // console.log(u);
    //     toast.success(u.msg);

    //     router.push("/verify-email");
    //   } else {
    //     const u = await user.json();
    //     setError("root", u.msg);
    //     toast.error(u.error);
    //   }
    // } catch (error) {
    //   console.log(error);
    //   toast.error("An error occurred. Please try again later.");
    // }
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
              <div className="grid gap-6">
                <div className="grid gap-2 ">
                  <Label htmlFor="name">Username</Label>
                  <Input
                    {...register("name")}
                    type="text"
                    className={cn({
                      "focus-visible:ring-red-500": errors.name,
                    })}
                    placeholder="James"
                  />
                  {errors?.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2 ">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
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
                <div className="grid gap-2 ">
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
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">Repeat Password</Label>
                  <Input
                    {...register("confirm_password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.confirm_password,
                    })}
                    placeholder="Repeat Password"
                  />
                  {errors?.confirm_password && (
                    <p className="text-sm text-red-500">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Button disabled={isPending}>
                  {!isPending ? "Sign up" : "Loading..."}
                </Button>
                {errors.root && (
                  <p className="text-sm text-red-500">{errors.root.message}</p>
                )}
              </div>
            </form>
            <Separator />
            <GoogleButton
              signIn={false}
              onClick={googleSignup}
              disabled={isPending}
            />
            <GithubButton
              signIn={false}
              onClick={githubSignup}
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
