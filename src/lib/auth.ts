// src/lib/auth.ts

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client"; // Import your UserRole enum

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate input
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        // 2. Find user
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) return null; // User not found
        // 3. Check if password is set (might be OAuth user)
        if (!user.password) return null; // No password set for this user

        //4.check email verification
        if (!user.emailVerified) return null; // Email not verified

        // 5. Compare password hash
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return null; // Passwords don't match

        // 5. Return user object if valid
        return user;
      },
    }), // End CredentialsProvider
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // --- JWT Callback: Essential for JWT Strategy ---
    // This callback is invoked *before* the session callback.
    // It receives the user object from 'authorize' or the adapter on initial sign-in.
    // Its job is to encode necessary user data into the JWT payload.
    async jwt({ token, user }) {
      // On initial sign-in (trigger is 'signIn' or 'signUp'), add custom claims to the token
      if (user) {
        // The user object passed contains details from authorize or adapter
        token.id = user.id;
        token.role = user.role; // Add role from user object
        token.picture = user.image; // Use standard 'picture' claim for image
        // name and email should be included by default, but ensure they are if needed
        token.name = user.name;
        token.email = user.email;
      }
      // Subsequent calls (trigger is 'update' or 'getSession') will just pass the existing token

      return token; // The token object is encrypted and stored in the session cookie
    },
    // --- End JWT Callback ---

    // --- Session Callback: Reads data FROM the JWT Token ---
    // This callback receives the *decoded* JWT payload (in the 'token' parameter).
    // Its job is to shape the final 'session.user' object available to the client.
    async session({ session, token }) {
      // Assign properties from the token to the session.user object
      if (token && session.user) {
        session.user.id = token.id as string; // Get ID from token
        session.user.role = token.role as UserRole; // Get role from token
        session.user.image = token.picture as string | null; // Get image from token's picture claim
        session.user.name = token.name; // Get name from token
        session.user.email = (token.email as string | null | undefined) ?? session.user.email; // Get email from token
      }
      return session; // Return the session object for client/server use
    },
    // --- End Session Callback ---
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
});

export { UserRole };
