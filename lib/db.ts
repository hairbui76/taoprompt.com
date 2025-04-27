import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

// Create a single supabase client for the server
export const createServerClient = () => {
	return createClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_ANON_KEY!
	).schema("public");
};

// Get or create client ID from cookies
export const getOrCreateClientId = async () => {
	const cookieStore = await cookies();
	const clientId = cookieStore.get("clientId")?.value;

	if (clientId) {
		return clientId;
	}

	const newClientId = uuidv4();
	cookieStore.set("clientId", newClientId, {
		path: "/",
		maxAge: 60 * 60 * 24 * 365, // 1 year
		sameSite: "strict",
	});

	return newClientId;
};
