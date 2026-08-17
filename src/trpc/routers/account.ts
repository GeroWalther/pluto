import { hash } from 'bcryptjs';
import { z } from 'zod';
import { AuthProvider } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import prisma from '@/db/db';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { emailSchema, profileSchema, signUpSchema } from '@/lib/validators';
import { randomToken } from '@/lib/utils';
import { sendEmail } from '@/lib/sendEmail';
import { renderVerificationEmail } from '@/server/services/emails';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

async function issueVerification(userId: string, name: string | null, email: string) {
  const token = randomToken(32);

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken: token,
      verificationExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
    },
  });

  await sendEmail({
    to: email,
    subject: 'Verify your Pluto account',
    html: renderVerificationEmail({ name, token }),
  });

  return token;
}

export const accountRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, provider: true },
    });

    if (existing) {
      throw new TRPCError({
        code: 'CONFLICT',
        message:
          existing.provider === AuthProvider.CREDENTIALS
            ? 'An account with that email already exists. Try signing in.'
            : 'That email is already registered through a social login. Use that button instead.',
      });
    }

    const user = await ctx.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hash(input.password, 12),
        provider: AuthProvider.CREDENTIALS,
      },
      select: { id: true, name: true, email: true },
    });

    await issueVerification(user.id, user.name, user.email);

    return { email: user.email };
  }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { verificationToken: input.token },
        select: { id: true, emailVerifiedAt: true, verificationExpiresAt: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'That verification link is not valid.',
        });
      }

      if (user.emailVerifiedAt) return { alreadyVerified: true };

      if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'That verification link has expired. Request a new one below.',
        });
      }

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
          verificationToken: null,
          verificationExpiresAt: null,
        },
      });

      return { alreadyVerified: false };
    }),

  resendVerification: publicProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true, name: true, email: true, emailVerifiedAt: true },
      });

      // Always report success — otherwise this endpoint tells an attacker
      // which addresses have accounts.
      if (user && !user.emailVerifiedAt) {
        await issueVerification(user.id, user.name, user.email);
      }

      return { sent: true };
    }),

  me: privateProcedure.query(({ ctx }) =>
    ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        stripeAccountId: true,
        stripePayoutsEnabled: true,
      },
    })
  ),

  updateProfile: privateProcedure
    .input(profileSchema)
    .mutation(({ ctx, input }) =>
      ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { name: input.name, bio: input.bio || null },
        select: { id: true, name: true, bio: true },
      })
    ),
});
