import { ProductCategory } from '@prisma/client';
import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('That does not look like a valid email address')
  .transform((v) => v.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Please enter your name').max(60),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const uploadedFileSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  name: z.string().min(1),
});

export const productInputSchema = z.object({
  name: z.string().min(3, 'Give your product a name').max(80),
  description: z
    .string()
    .min(30, 'Describe your product in at least 30 characters')
    .max(4000),
  priceCents: z
    .number()
    .int('Price must be a whole number of cents')
    .min(100, 'The minimum price is €1.00')
    .max(1_000_000, 'The maximum price is €10,000'),
  category: z.nativeEnum(ProductCategory),
  images: z
    .array(uploadedFileSchema)
    .min(1, 'Upload at least one preview image')
    .max(5, 'You can upload at most 5 preview images'),
  files: z
    .array(uploadedFileSchema)
    .min(1, 'Upload the file buyers will receive')
    .max(10, 'You can attach at most 10 files'),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export const productSortSchema = z.enum([
  'newest',
  'price-asc',
  'price-desc',
  'popular',
]);

export type ProductSort = z.infer<typeof productSortSchema>;

export const productQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  sellerId: z.string().optional(),
  minCents: z.number().int().min(0).optional(),
  maxCents: z.number().int().min(0).optional(),
  sort: productSortSchema.default('newest'),
  limit: z.number().int().min(1).max(48).default(12),
  cursor: z.string().nullish(),
});

export const reviewInputSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(60),
  bio: z.string().max(280, 'Keep your bio under 280 characters').optional(),
});
