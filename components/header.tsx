"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Brain, LogIn, LogOut, Plus, User } from "lucide-react";
import Link from "next/link";
import { AdminNav } from "./admin-nav";

export function Header() {
	const { isAuthenticated, user, signOut, isLoading } = useAuth();

	return (
		<header className="sticky top-0 z-50 border-b bg-background/40 backdrop-blur px-4">
			<div className="container mx-auto flex items-center justify-between py-3">
				<Link href="/" className="flex items-center gap-x-2.5">
					<Brain className="h-5 w-5 text-primary" />
					<span className="text-lg font-semibold">Tạo Prompt AI</span>
				</Link>

				<div className="flex items-center space-x-2">
					{isAuthenticated && (
						<Link href="/create">
							<Button size="sm" className="h-8 gap-1.5">
								<Plus className="h-4 w-4" />
								Tạo mới
							</Button>
						</Link>
					)}

					<AdminNav />
					<ThemeToggle />

					{isLoading ? (
						<div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
					) : isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="h-8 w-8 rounded-full p-0">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={user?.image || ""}
											alt={user?.name || "User"}
										/>
										<AvatarFallback>
											<User className="h-4 w-4" />
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<div className="flex items-center justify-start gap-2 p-2">
									<div className="flex flex-col space-y-1 leading-none">
										{user?.name && <p className="font-medium">{user.name}</p>}
										{user?.email && (
											<p className="text-sm text-muted-foreground">
												{user.email}
											</p>
										)}
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link href="/create">
										<Plus className="mr-2 h-4 w-4" />
										<span>Tạo mới</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-red-600 cursor-pointer"
									onClick={() => signOut({ callbackUrl: "/" })}>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Đăng xuất</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button variant="outline" size="sm" asChild>
							<Link href="/auth/signin">
								<LogIn className="mr-2 h-4 w-4" />
								Đăng nhập
							</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
