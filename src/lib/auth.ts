import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const ALLOWED_DOMAIN = "vitstudent.ac.in";

// Exact-match domain check, not just a suffix check — avoids edge cases
// like "attacker-vitstudent.ac.in@evil.com" slipping past endsWith().
function isValidStudentEmail(email: string): boolean {
  const parts = email.toLowerCase().split("@");
  return parts.length === 2 && parts[1] === ALLOWED_DOMAIN;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email ?? profile?.email;

      // 1. Walled garden — only @vitstudent.ac.in may create an account or log in
      if (!email || !isValidStudentEmail(email)) {
        return false;
      }

      // 2. Defends against a hypothetical unverified alias slipping through
      if (account?.provider === "google" && profile?.email_verified === false) {
        return false;
      }

      // 3. Suspended users are locked out immediately, even on re-auth
      const existingUser = await db.user.findUnique({
        where: { email },
        select: { isSuspended: true },
      });
      if (existingUser?.isSuspended) {
        return "/auth/error?reason=suspended";
      }

      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    error: "/auth/error",
  },
});