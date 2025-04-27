"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
	const { user, isAuthenticated, signOut } = useAuth();

	return (
		<div className="container flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto text-center">
			<div className="p-6 space-y-6 bg-card rounded-lg shadow-lg">
				<div className="flex justify-center">
					<ShieldAlert className="h-16 w-16 text-destructive" />
				</div>

				<h1 className="text-2xl font-bold">Access Denied</h1>

				{isAuthenticated ? (
					<div className="space-y-4">
						<p className="text-muted-foreground">
							Your account status is pending verification. An administrator
							needs to approve your account before you can access this resource.
						</p>
						<div className="space-y-2">
							<p className="text-sm">
								Signed in as:{" "}
								<span className="font-semibold">{user?.email}</span>
							</p>
							<Button variant="outline" onClick={() => signOut()}>
								Sign Out
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-muted-foreground">
							You don't have permission to access this resource.
						</p>
						<Button asChild>
							<Link href="/auth/signin">Sign In</Link>
						</Button>
					</div>
				)}

				<div className="pt-4 border-t">
					<Button variant="ghost" asChild>
						<Link href="/" className="flex items-center">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Return to Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
