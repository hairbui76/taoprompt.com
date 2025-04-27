import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { createServerClient } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import type { User, Account, Profile } from "next-auth";

export const authOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.OAUTH_GITHUB_ID || "",
			clientSecret: process.env.OAUTH_GITHUB_SECRET || "",
			profile(profile) {
				return {
					id: profile.id.toString(),
					name: profile.name || profile.login,
					email: profile.email,
					image: profile.avatar_url,
					provider: "github",
					providerAccountId: profile.id.toString(),
				};
			},
		}),
		GoogleProvider({
			clientId: process.env.OAUTH_GOOGLE_ID || "",
			clientSecret: process.env.OAUTH_GOOGLE_SECRET || "",
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					provider: "google",
					providerAccountId: profile.sub,
				};
			},
		}),
	],
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
		signOut: "/auth/signin",
	},
	callbacks: {
		async jwt(params: {
			token: JWT;
			user: User | any;
			account: Account | null;
			profile?: Profile;
			trigger?: "signIn" | "signUp" | "update";
			isNewUser?: boolean;
			session?: any;
		}) {
			const { token, user, account } = params;
			// Add provider to token
			if (user && account) {
				token.provider = account.provider;
				// Add provider account ID to token
				token.providerAccountId = user.providerAccountId;
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			// Add user info to session
			if (session.user && token.sub) {
				session.user.id = token.sub;
				session.user.provider = token.provider as string;
				session.user.providerAccountId = token.providerAccountId as string;
			}
			return session;
		},
		async signIn(params: {
			user: User;
			account: Account | null;
			profile?: any;
			email?: any;
			credentials?: any;
		}) {
			const { user, account } = params;

			if (!user.email) {
				return false;
			}

			try {
				// Always generate a new UUID for the user to avoid foreign key constraint issues
				const newUserId = uuidv4();

				// Check if user exists in our database by email and provider
				const supabase = createServerClient();
				const { data: existingUser, error: lookupError } = await supabase
					.from("users")
					.select("id")
					.eq("email", user.email)
					.eq("provider", account?.provider || "unknown")
					.single();

				if (existingUser) {
					// User exists, use their existing ID for the session
					user.id = existingUser.id;
					return true;
				}

				// Insert new user with generated UUID
				const { error: insertError } = await supabase.from("users").insert({
					id: newUserId,
					email: user.email,
					name: user.name,
					image: user.image,
					provider: account?.provider || "unknown",
					provider_account_id: user.providerAccountId,
					status: "pending",
					role: "user",
				});

				if (insertError) {
					console.error("Error inserting user:", insertError);
					return false;
				}

				// Set the user ID to our new UUID for the session
				user.id = newUserId;
				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false;
			}
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
