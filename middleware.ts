import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";

// Define which routes require authentication
const protectedRoutes = ["/create", "/api/prompts"];

// Define which routes require admin role
const adminRoutes = ["/admin"];

// Create a Supabase client for middleware
const createMiddlewareClient = (req: NextRequest) => {
	const supabaseUrl = process.env.SUPABASE_URL!;
	const supabaseKey = process.env.SUPABASE_ANON_KEY!;

	// Create client
	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			persistSession: false,
		},
	});
};

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the route is protected
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	// Check if the route is admin-only
	const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

	// If route requires authentication or admin access
	if (isProtectedRoute || isAdminRoute) {
		const token = await getToken({ req: request });

		// If not authenticated at all
		if (!token)
			return NextResponse.redirect(new URL("/auth/signin", request.url));

		const userId = token.sub;
		const email = token.email as string | undefined;

		if (!userId || !email) {
			return NextResponse.redirect(new URL("/auth/signin", request.url));
		}

		// Check user permissions in database
		const supabase = createMiddlewareClient(request);
		const { data: userData, error } = await supabase
			.from("users")
			.select("status, role")
			.eq("id", userId)
			.single();

		// Error checking the database
		if (error) {
			console.error("Database error in middleware:", error);

			// For API routes, return JSON
			if (pathname.startsWith("/api/")) {
				return NextResponse.json(
					{ error: "Server error checking permissions" },
					{ status: 500 }
				);
			}

			// For UI routes, redirect to error page
			return NextResponse.redirect(new URL("/auth/error", request.url));
		}

		// User doesn't exist in our database or status is not verified
		if (!userData || userData.status !== "verified") {
			// For API routes, return JSON
			if (pathname.startsWith("/api/")) {
				return NextResponse.json(
					{
						error:
							"Your account is pending verification. Please wait for an admin to approve your account.",
					},
					{ status: 403 }
				);
			}

			// For UI routes, redirect to access-denied page
			return NextResponse.redirect(new URL("/auth/access-denied", request.url));
		}

		// If route requires admin role, check if user is admin
		if (isAdminRoute && userData.role !== "admin") {
			// For API routes, return JSON
			if (pathname.startsWith("/api/")) {
				return NextResponse.json(
					{
						error: "You don't have admin privileges to access this resource.",
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
