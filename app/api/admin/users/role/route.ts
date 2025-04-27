import { NextRequest, NextResponse } from "next/server";
import { updateUserRole, isAdmin } from "@/lib/users";

export async function PUT(req: NextRequest) {
	try {
		// Check if the current user is an admin
		const isUserAdmin = await isAdmin();

		if (!isUserAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized. Only admins can update user roles." },
				{ status: 403 }
			);
		}

		// Get request body
		const body = await req.json();
		const { userId, role } = body;

		// Validate request body
		if (!userId || !role) {
			return NextResponse.json(
				{ error: "Missing required fields: userId and role" },
				{ status: 400 }
			);
		}

		// Validate role value
		if (!["user", "admin"].includes(role)) {
			return NextResponse.json(
				{ error: "Invalid role value. Must be one of: user, admin" },
				{ status: 400 }
			);
		}

		// Update user role
		const success = await updateUserRole(userId, role);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to update user role" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: `User role updated to ${role}`,
		});
	} catch (error) {
		console.error("Error in PUT /api/admin/users/role:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
