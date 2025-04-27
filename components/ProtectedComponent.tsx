"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedComponentProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function ProtectedComponent({
	children,
	fallback,
}: ProtectedComponentProps) {
	const { isAuthenticated, isLoading, signIn } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/signin");
		}
	}, [isLoading, isAuthenticated, router]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[40vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			fallback || (
				<div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
					<p className="text-lg">Vui lòng đăng nhập để tiếp tục</p>
					<Button onClick={() => signIn("github")}>Đăng nhập với GitHub</Button>
				</div>
			)
		);
	}

	return <>{children}</>;
}
