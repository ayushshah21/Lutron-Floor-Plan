import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
      ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true; // Return `true` to allow the sign-in
    },
    async redirect({ url, baseUrl }) {
      return baseUrl; // Redirect to the base URL after sign-in
    },
    // ...add more callbacks if needed
  },
  // ...add more configuration if needed
};
