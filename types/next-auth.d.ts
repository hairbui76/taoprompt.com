import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			provider?: string;
			providerAccountId?: string;
		};
	}

	interface User {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
		provider?: string;
		providerAccountId?: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		provider?: string;
		providerAccountId?: string;
	}
}
