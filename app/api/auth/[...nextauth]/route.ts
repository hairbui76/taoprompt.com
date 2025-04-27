import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
	providers: [
		GithubProvider({
			clientId: process.env.OAUTH_GITHUB_ID || "",
			clientSecret: process.env.OAUTH_GITHUB_SECRET || "",
		}),
	],
	pages: {
		signIn: "/auth/signin",
	},
	callbacks: {
		async session({ session, token }) {
			// Add user info to session
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
