// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

interface ExtendedToken {
  id?: string;
  username?: string;
  firstName?: string;
  role?: string;
  [key: string]: unknown;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;
        const { username, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ username });
          if (!user) return null;

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return null;

          return {
            id: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            role: user.role,
          };
        } catch (err) {
          console.error("❌ Auth error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      const customToken = token as ExtendedToken;
      if (user) {
        customToken.id = user.id;
        customToken.username = (user as any).username;
        customToken.firstName = (user as any).firstName;
        customToken.role = (user as any).role;
      }
      return customToken;
    },
    async session({ session, token }) {
      const customToken = token as ExtendedToken;
      if (session.user) {
        session.user.id = customToken.id!;
        session.user.username = customToken.username!;
        session.user.firstName = customToken.firstName!;
        session.user.role = customToken.role!;
      }
      return session;
    },
  },
};
