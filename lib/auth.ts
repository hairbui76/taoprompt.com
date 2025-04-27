import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get session on the server side
export async function getSession() {
	return await getServerSession(authOptions);
}

// Check if user is authenticated on the server side
export async function getCurrentUser() {
	const session = await getSession();
	return session?.user;
}

// Middleware to protect API routes
export async function authMiddleware(
	req: NextRequest,
	handler: (req: NextRequest) => Promise<NextResponse>
) {
	const session = await getSession();

	if (!session?.user) {
		return NextResponse.json(
			{ error: "Unauthorized: Authentication required" },
			{ status: 401 }
		);
	}

	return handler(req);
}
