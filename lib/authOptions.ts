import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// 👤 Extended user interface
interface ExtendedUser {
  id: string;
  _id: string;
  username: string;
  firstName: string;
  role: string;
}

interface ExtendedToken {
  id?: string;
  _id?: string;
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
      authorize: async (credentials): Promise<ExtendedUser | null> => {
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
            _id: user._id.toString(),
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
        const u = user as ExtendedUser;
        customToken.id = u.id;
        customToken._id = u._id;
        customToken.username = u.username;
        customToken.firstName = u.firstName;
        customToken.role = u.role;
      }

      return customToken;
    },
    async session({ session, token }) {
      const customToken = token as ExtendedToken;

      if (session.user) {
        session.user.id = customToken.id!;
        session.user._id = customToken._id!;
        session.user.username = customToken.username!;
        session.user.firstName = customToken.firstName!;
        session.user.role = customToken.role!;
      }

      return session;
    },
  },
};
