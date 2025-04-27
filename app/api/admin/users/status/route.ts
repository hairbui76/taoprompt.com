import { NextRequest, NextResponse } from "next/server";
import { updateUserStatus, isAdmin } from "@/lib/users";

export async function PUT(req: NextRequest) {
	try {
		// Check if the current user is an admin
		const isUserAdmin = await isAdmin();

		if (!isUserAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized. Only admins can update user status." },
				{ status: 403 }
			);
		}

		// Get request body
		const body = await req.json();
		const { userId, status } = body;

		// Validate request body
		if (!userId || !status) {
			return NextResponse.json(
				{ error: "Missing required fields: userId and status" },
				{ status: 400 }
			);
		}

		// Validate status value
		if (!["pending", "verified", "rejected"].includes(status)) {
			return NextResponse.json(
				{
					error:
						"Invalid status value. Must be one of: pending, verified, rejected",
				},
				{ status: 400 }
			);
		}

		// Update user status
		const success = await updateUserStatus(userId, status);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to update user status" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: `User status updated to ${status}`,
		});
	} catch (error) {
		console.error("Error in PUT /api/admin/users/status:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
