"use client";

import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
	const [isLoading, setIsLoading] = useState(false);

	const handleGithubSignIn = async () => {
		setIsLoading(true);
		try {
			await signIn("github", { callbackUrl: "/" });
		} catch (error) {
			console.error("Error signing in:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container flex items-center justify-center min-h-[60vh]">
			<div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold">Đăng nhập</h1>
					<p className="text-muted-foreground">
						Đăng nhập để truy cập các tính năng đầy đủ
					</p>
				</div>

				<div className="space-y-4">
					<Button
						variant="outline"
						className="w-full"
						onClick={handleGithubSignIn}
						disabled={isLoading}>
						{isLoading ? (
							<span className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Đang xử lý...
							</span>
						) : (
							<span className="flex items-center justify-center">
								<GithubIcon className="mr-2 h-4 w-4" />
								Đăng nhập với GitHub
							</span>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
