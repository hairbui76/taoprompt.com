"use client";

import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
	const [isLoading, setIsLoading] = useState<{
		github: boolean;
		google: boolean;
	}>({
		github: false,
		google: false,
	});

	const handleGithubSignIn = async () => {
		setIsLoading((prev) => ({ ...prev, github: true }));
		try {
			await signIn("github", { callbackUrl: "/" });
		} catch (error) {
			console.error("Error signing in with GitHub:", error);
		} finally {
			setIsLoading((prev) => ({ ...prev, github: false }));
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading((prev) => ({ ...prev, google: true }));
		try {
			await signIn("google", { callbackUrl: "/" });
		} catch (error) {
			console.error("Error signing in with Google:", error);
		} finally {
			setIsLoading((prev) => ({ ...prev, google: false }));
		}
	};

	const LoadingSpinner = () => (
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
	);

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
						disabled={isLoading.github || isLoading.google}>
						{isLoading.github ? (
							<span className="flex items-center justify-center">
								<LoadingSpinner />
								Đang xử lý...
							</span>
						) : (
							<span className="flex items-center justify-center">
								<GithubIcon className="mr-2 h-4 w-4" />
								Đăng nhập với GitHub
							</span>
						)}
					</Button>

					<Button
						variant="outline"
						className="w-full"
						onClick={handleGoogleSignIn}
						disabled={isLoading.github || isLoading.google}>
						{isLoading.google ? (
							<span className="flex items-center justify-center">
								<LoadingSpinner />
								Đang xử lý...
							</span>
						) : (
							<span className="flex items-center justify-center">
								<svg
									className="mr-2 h-4 w-4"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
										fill="currentColor"
									/>
								</svg>
								Đăng nhập với Google
							</span>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
