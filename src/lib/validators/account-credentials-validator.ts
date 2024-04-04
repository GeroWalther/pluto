import { z } from "zod";

export const AuthCredentialsValidator = z
  .object({
    name: z.string().max(20).min(3),
    email: z.string().email(),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters long.",
    }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"], // path of error
    message: "Passwords don't match",
  });

export type TAuthCredentialsValidator = z.infer<
  typeof AuthCredentialsValidator
>;

export const AuthCredentialsValidatorSignIn = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

export type TAuthCredentialsValidatorSignIn = z.infer<
  typeof AuthCredentialsValidator
>;

export const uploadSchema = z.object({
  name: z.string().min(3).max(15),
  price: z.string(),
  description: z.string().min(10).max(500),
  imageKey: z.string(),
  url: z.string(),
});

export type FormFields = z.infer<typeof uploadSchema>;
