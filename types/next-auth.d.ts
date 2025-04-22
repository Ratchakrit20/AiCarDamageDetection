// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      _id: string;
      username: string;
      firstName: string;
      role: string;
    };
  }

  interface User {
    id: string;
    _id: string;
    username: string;
    firstName: string;
    role: string;
  }
}
