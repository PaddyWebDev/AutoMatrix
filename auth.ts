import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";
import {
  fetchUserByRole,
  fetchUserByRoleForJWT,
} from "./hooks/user";
import { Role } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";
import { verifyPassword } from "./lib/bcryptjs";
import Credentials from "next-auth/providers/credentials";

export type ExtendedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser & DefaultSession["user"];
  }

  interface User extends ExtendedUser {} // Safe now
}

declare module "next-auth/jwt" {
  interface JWT extends ExtendedUser {} // For JWT token (client + server consistency)
}
export const {
  auth,
  signOut,
  signIn,
  handlers: { GET, POST },
} = NextAuth({
  pages: {
    signIn: "/guest/Login",
    error: "/guest/error",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user) return false;
      return true;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        return token;
      }
      if (!token.sub) return token;

      if (trigger === "update") {
        return { ...token, ...session.user };
      }

      const existingUser = await fetchUserByRoleForJWT(
        token.role,
        token.email!
      );
      if (!existingUser) return token;

      // token.role = existingUser.role;
      return token;
    },
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials: any) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.role
        ) {
          return null;
        }
        const user = await fetchUserByRole(credentials.role, credentials.email);
        if (!user) return null;

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: credentials.role,
        };
      },
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
});
