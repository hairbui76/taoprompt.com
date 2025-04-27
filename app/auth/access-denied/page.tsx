"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AccessDenied() {
	return (
		<div className="container flex items-center justify-center min-h-[60vh]">
			<div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
				<div className="flex justify-center">
					<AlertCircle className="text-red-500 h-16 w-16" />
				</div>
				<div className="text-center space-y-3">
					<h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
					<p className="text-muted-foreground">
						Rất tiếc, tài khoản của bạn không có quyền truy cập vào ứng dụng
						này.
					</p>
					<p className="text-sm text-muted-foreground">
						Chỉ những người dùng được cấp phép mới có thể sử dụng ứng dụng.
					</p>
				</div>

				<div className="space-y-4">
					<Button variant="outline" className="w-full" asChild>
						<Link href="/">Trở về trang chủ</Link>
					</Button>
					<Button
						variant="ghost"
						className="w-full text-red-500 hover:text-red-600 hover:bg-red-100"
						onClick={() => signOut({ callbackUrl: "/" })}>
						Đăng xuất
					</Button>
				</div>
			</div>
		</div>
	);
}
