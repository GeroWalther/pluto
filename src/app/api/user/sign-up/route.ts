// import { PrimaryActionEmailHtml } from "@/app/components/emails/PrimaryActionEmail";
// import { prisma } from "@/db/db";
// import { hash, generateRandomToken } from "@/lib/utils";
// import { resend } from "@/webhooks";
import { NextRequest } from "next/server";

type userSignUp = {
  // name: string;
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user: userSignUp = {
    // name: body.name,
    email: body.email,
    password: body.password,
  };

  if (!user || !user.email) {
    return Response.json({ error: "Error creating user" }, { status: 500 });
  }

  return Response.json("Success!", {
    status: 200,
  });
}

// if (!user || !user.email || !user.password) {
//   return Response.json({ error: "Error creating user" }, { status: 500 });
// }

// const storedUser = await prisma.user.findUnique({
//   where: {
//     email: user.email as string,
//   },
// });

// if (storedUser) {
//   throw new Error("User already registered. Please sign in instead");
// }

//TODO const hashedPassword = hash(user.password);

// const newUser = await prisma.user.create({
//   data: {
//     name: user.name,
//     email: user.email,
//     password: user.password,
//   },
// });

// if (newUser) {
//   const token = generateRandomToken();

//   // send receipt Email
//   try {
//     const data = await resend.emails.send({
//       from: `Pluto Market <${process.env.EMAIL}>`,
//       to: [user.email],
//       subject: "Thanks for your order! This is your receipt.",
//       html: PrimaryActionEmailHtml({
//         actionLabel: "verify your account",
//         buttonText: "Verify Account",
//         href: `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`,
//       }),
//     });
//     console.log(data);
//     return Response.json(data);
//   } catch (error) {
//     console.log("Email failed to sent! ERROR: ", error);
//     return Response.json({ error });
//   }
// }
