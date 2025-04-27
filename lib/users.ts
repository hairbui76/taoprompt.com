import { createServerClient } from "./db";
import { getCurrentUser } from "./auth";

export interface User {
	id: string;
	email: string;
	name: string | null;
	image: string | null;
	provider: string;
	status: "pending" | "verified" | "rejected";
	role: "user" | "admin";
	created_at: string;
	updated_at: string;
}

// Get current user with role and status information
export async function getCurrentUserWithRole(): Promise<User | null> {
	const user = await getCurrentUser();

	if (!user) {
		return null;
	}

	const supabase = createServerClient();
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("id", user.id)
		.single();

	if (error || !data) {
		console.error("Error fetching user:", error);
		return null;
	}

	return data as User;
}

// Check if the current user is an admin
export async function isAdmin(): Promise<boolean> {
	const user = await getCurrentUserWithRole();
	return user?.role === "admin";
}

// Check if the current user is verified
export async function isVerified(): Promise<boolean> {
	const user = await getCurrentUserWithRole();
	return user?.status === "verified";
}

// Get all users (admin only)
export async function getAllUsers(): Promise<User[] | null> {
	const isCurrentUserAdmin = await isAdmin();

	if (!isCurrentUserAdmin) {
		return null;
	}

	const supabase = createServerClient();
	const { data, error } = await supabase
		.from("users")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching users:", error);
		return null;
	}

	return data as User[];
}

// Update user status (admin only)
export async function updateUserStatus(
	userId: string,
	status: "pending" | "verified" | "rejected"
): Promise<boolean> {
	const isCurrentUserAdmin = await isAdmin();

	if (!isCurrentUserAdmin) {
		return false;
	}

	const supabase = createServerClient();
	const { error } = await supabase
		.from("users")
		.update({ status, updated_at: new Date().toISOString() })
		.eq("id", userId);

	if (error) {
		console.error("Error updating user status:", error);
		return false;
	}

	return true;
}

// Update user role (admin only)
export async function updateUserRole(
	userId: string,
	role: "user" | "admin"
): Promise<boolean> {
	const isCurrentUserAdmin = await isAdmin();

	if (!isCurrentUserAdmin) {
		return false;
	}

	const supabase = createServerClient();
	const { error } = await supabase
		.from("users")
		.update({ role, updated_at: new Date().toISOString() })
		.eq("id", userId);

	if (error) {
		console.error("Error updating user role:", error);
		return false;
	}

	return true;
}
