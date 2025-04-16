import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from 'bcryptjs';

// ✅ Extend NextAuth types to include role
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string;
            firstName: string;
            role: string; // Add the role property
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        firstName: string;
        role: string; // Add the role property
    }
}

const authOptions: NextAuthOptions = {  
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials) return null;

                const { username, password } = credentials;

                try {
                    await connectMongoDB();
                    const user = await User.findOne({ username }) as any;

                    if (!user) return null;

                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (!passwordMatch) return null;

                    return {
                        id: user._id.toString(),
                        username: user.username,
                        firstName: user.firstName,
                        role: user.role // Add the role property
                    };
                } catch (error) {
                    console.error("Error during authentication", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
                token.firstName = (user as any).firstName;
                token.role = (user as any).role; // Add the role property
            }
            return token;
        },
        
        async session({ session, token }) {
            console.log("✅ Session Token:", token); 
            if (!token.id) {
                console.error("❌ Session token is missing user ID.");
            }
            session.user.id = token.id;
            session.user.username = token.username;
            session.user.firstName = token.firstName;
            session.user.role = token.role; // Add the role property
            return session;
        }
    }
};
export { authOptions };
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };