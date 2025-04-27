import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, isAdmin } from "@/lib/users";

export async function GET(req: NextRequest) {
	try {
		// Check if the current user is an admin
		const isUserAdmin = await isAdmin();

		if (!isUserAdmin) {
			return NextResponse.json(
				{ error: "Unauthorized. Only admins can access this endpoint." },
				{ status: 403 }
			);
		}

		// Get all users
		const users = await getAllUsers();

		if (!users) {
			return NextResponse.json(
				{ error: "Failed to fetch users" },
				{ status: 500 }
			);
		}

		return NextResponse.json({ users });
	} catch (error) {
		console.error("Error in GET /api/admin/users:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
