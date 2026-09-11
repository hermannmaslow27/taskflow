import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users, projects, projectMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "placeholder",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        try {
          const existing = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (existing) {
            user.id = existing.id;
            const updateFields: { image?: string; name?: string } = {};
            if (!existing.image && user.image) updateFields.image = user.image;
            if (!existing.name && user.name) updateFields.name = user.name;
            if (Object.keys(updateFields).length > 0) {
              await db.update(users).set(updateFields).where(eq(users.id, existing.id));
            }
          } else {
            const newUserId = crypto.randomUUID();
            await db.insert(users).values({
              id: newUserId,
              name: user.name || "Utilisateur",
              email: email,
              image: user.image || null,
            });
            user.id = newUserId;

            // Create default project
            const defaultProjectId = crypto.randomUUID();
            await db.insert(projects).values({
              id: defaultProjectId,
              name: "Mon premier projet",
              color: "#6366F1",
              ownerId: newUserId,
            });

            await db.insert(projectMembers).values({
              projectId: defaultProjectId,
              userId: newUserId,
              role: "owner",
            });
          }
          return true;
        } catch (err) {
          console.error("OAuth signIn error:", err);
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || token.sub || "";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "taskflow-super-secret-production-key-change-in-prod-2026",
});
