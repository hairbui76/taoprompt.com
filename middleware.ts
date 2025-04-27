import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define which routes require authentication
const protectedRoutes = ["/create", "/api/prompts"];

// Get allowed usernames from environment variable or use defaults
const getAllowedUsernames = (): string[] => {
	const envUsernames = process.env.ALLOWED_USERNAMES;
	if (envUsernames) {
		return envUsernames.split(",").map((username) => username.trim());
	}
	// Default usernames if not specified in environment
	return ["MrYasuo", "hairbui76"];
};

// Get the list of allowed usernames
const ALLOWED_USERNAMES = getAllowedUsernames();

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the route is protected
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		const token = await getToken({ req: request });
		console.log(token);

		// If not authenticated at all
		if (!token)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		// Check if user is in the allowed list
		const username = token?.name as string | undefined;
		if (!username || !ALLOWED_USERNAMES.includes(username)) {
			// For API routes, return JSON
			if (pathname.startsWith("/api/")) {
				return NextResponse.json(
					{ error: "Access denied. Your username is not authorized." },
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
