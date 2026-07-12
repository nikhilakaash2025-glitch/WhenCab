import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const ALLOWED_DOMAIN = "vitstudent.ac.in";

// Exact-match domain check, not just a suffix check
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

      // 4. Privacy Shield: Strip out the VIT Registration Number (e.g., 25BDE0097)
      // We look at both user.name (from adapter) and profile.name (from Google OAuth)
      const rawName = user.name ?? profile?.name;
      if (rawName) {
        // Regex matches 2 digits, 3 letters, 4 digits (case-insensitive)
        const cleanedName = rawName.replace(/\b\d{2}[A-Z]{3}\d{4}\b/gi, "").trim();
        user.name = cleanedName; // Updates what the Prisma Adapter writes to the DB
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
