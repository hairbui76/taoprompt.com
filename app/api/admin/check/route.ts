import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/users";

export async function GET(req: NextRequest) {
	try {
		// Check if the current user is an admin
		const isUserAdmin = await isAdmin();

		return NextResponse.json({ isAdmin: isUserAdmin });
	} catch (error) {
		console.error("Error in GET /api/admin/check:", error);
		return NextResponse.json(
			{ error: "Internal server error", isAdmin: false },
			{ status: 500 }
		);
	}
}
