import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { verifyPassword } from "./lib/bcryptjs";
import { fetchUserByRole } from "./hooks/user";

const AuthConfig: NextAuthConfig = {
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
} satisfies NextAuthConfig;

export default AuthConfig;
