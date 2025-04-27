"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminNav() {
	const { user, isAuthenticated } = useAuth();
	const [isUserAdmin, setIsUserAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function checkAdminStatus() {
			if (isAuthenticated && user) {
				try {
					const response = await fetch("/api/admin/check");
					if (response.ok) {
						const data = await response.json();
						setIsUserAdmin(data.isAdmin);
					}
				} catch (error) {
					console.error("Error checking admin status:", error);
				} finally {
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
			}
		}

		checkAdminStatus();
	}, [isAuthenticated, user]);

	if (!isAuthenticated || isLoading || !isUserAdmin) {
		return null;
	}

	return (
		<Button variant="outline" size="sm" asChild className="hidden md:flex">
			<Link href="/admin" className="flex items-center">
				<ShieldCheck className="mr-2 h-4 w-4" />
				<span>Admin</span>
			</Link>
		</Button>
	);
}
