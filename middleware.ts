import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define which routes require authentication
const protectedRoutes = ["/create", "/api/prompts"];

// Get allowed usernames from environment variable or use defaults
const getAllowedEmails = (): string[] => {
	const envAllowedEmails = process.env.ALLOWED_EMAILS;
	if (envAllowedEmails) {
		const allowedEmails = envAllowedEmails.split("|");
		return allowedEmails.map((email) => email.trim());
	}
	return [];
};

// Get the list of allowed usernames
const ALLOWED_EMAILS = getAllowedEmails();

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the route is protected
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		const token = await getToken({ req: request });

		// If not authenticated at all
		if (!token)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		// Check if user is in the allowed list
		const email = token?.email as string | undefined;
		if (!email || !ALLOWED_EMAILS.includes(email)) {
			// For API routes, return JSON
			if (pathname.startsWith("/api/")) {
				return NextResponse.json(
					{
						error: "Access denied. You are not authorized to access this page.",
					},
					{ status: 403 }
				);
			}
			// For UI routes, redirect to access-denied page
			return NextResponse.redirect(new URL("/auth/access-denied", request.url));
		}
	}

	return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
	matcher: [
		// Match all routes except static files, api routes that don't need auth, and auth routes
		"/((?!_next/static|_next/image|favicon.ico|auth/signin|auth/access-denied|api/auth).*)",
	],
};
