import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "widata-secret-prototype-widodomartani-2026",
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          include: { wilayah: { include: { parent: true } } },
        });

        if (!user || !user.aktif) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          name: user.nama,
          email: user.username,
          role: user.role,
          wilayahId: user.wilayahId,
          wilayahNama: user.wilayah?.nama ?? "",
          dukuhNama: user.wilayah?.parent?.nama ?? user.wilayah?.nama ?? "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.wilayahId = (user as any).wilayahId;
        token.wilayahNama = (user as any).wilayahNama;
        token.dukuhNama = (user as any).dukuhNama;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).wilayahId = token.wilayahId;
        (session.user as any).wilayahNama = token.wilayahNama;
        (session.user as any).dukuhNama = token.dukuhNama;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
