import { z } from 'zod';

export const AuthCredentialsValidator = z
  .object({
    name: z.string().max(20),
    email: z.string().email(),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters long.',
    }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'], // path of error
    message: "Passwords don't match",
  });

export type TAuthCredentialsValidator = z.infer<
  typeof AuthCredentialsValidator
>;
