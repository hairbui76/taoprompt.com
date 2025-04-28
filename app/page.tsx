"use client";

import { PromptDetailModal } from "@/components/prompt-detail-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Prompt } from "@/types/database";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
	const [prompts, setPrompts] = useState<Prompt[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

	useEffect(() => {
		const fetchPrompts = async () => {
			try {
				setIsLoading(true);
				const response = await fetch("/api/prompts?status=public");

				if (response.status === 401) {
					// Redirect to signin page if unauthorized
					window.location.href = "/auth/signin";
					return;
				}

				if (response.status === 403) {
					setError(
						"Bạn không có quyền truy cập. Tài khoản của bạn không được phép sử dụng ứng dụng này."
					);
					setIsLoading(false);
					return;
				}

				if (!response.ok) {
					throw new Error("Không thể tải dữ liệu");
				}

				const data = await response.json();
				setPrompts(data.prompts);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
			} finally {
				setIsLoading(false);
			}
		};

		fetchPrompts();
	}, []);

	const renderCategories = (categories: string[]) => {
		if (!categories || categories.length === 0) return null;

		const visibleCategories = categories.slice(0, 2);
		const remainingCount = categories.length - 2;

		return (
			<div className="flex flex-wrap items-center gap-2">
				{visibleCategories.map((category) => (
					<Badge
						key={category}
						variant="outline"
						className="bg-muted/50 hover:bg-muted text-xs font-normal">
						{category}
					</Badge>
				))}
				{remainingCount > 0 && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge
									variant="outline"
									className="bg-muted/50 hover:bg-muted text-xs font-normal cursor-pointer">
									+{remainingCount}
								</Badge>
							</TooltipTrigger>
							<TooltipContent className="flex flex-wrap gap-1 max-w-[200px] p-2">
								{categories.slice(2).map((category) => (
									<Badge
										key={category}
										variant="outline"
										className="bg-muted/50 text-xs font-normal">
										{category}
									</Badge>
								))}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<main className="flex-1">
				{/* Hero Section */}
				<div className="py-12 border-b bg-muted/40">
					<div className="container mx-auto px-4">
						<h1 className="text-3xl font-bold text-center mb-3">
							Thư Viện Prompt
						</h1>
						<p className="text-muted-foreground text-center max-w-[600px] mx-auto">
							Khám phá và sử dụng các prompt chuyên nghiệp được tối ưu cho nhiều
							lĩnh vực khác nhau
						</p>
					</div>
				</div>

				<div className="container mx-auto px-4 py-12">
					{/* Loading State */}
					{isLoading && (
						<div className="text-center py-8">
							<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
							<p className="text-muted-foreground">Đang tải dữ liệu...</p>
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="text-center py-8">
							<p className="text-red-500">{error}</p>
						</div>
					)}

					{/* Prompt Grid */}
					{!isLoading && !error && (
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{prompts.map((prompt) => (
								<Card
									key={prompt.id}
									className="group flex flex-col border-[#27272A] hover:border-[#3F3F46] transition-colors h-[280px]">
									<CardHeader className="flex flex-col space-y-3 flex-shrink-0">
										<CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-base leading-tight">
											{prompt.title || "Untitled Prompt"}
										</CardTitle>
										<CardDescription className="line-clamp-3 text-sm">
											{prompt.user_request}
										</CardDescription>
									</CardHeader>

									<CardContent className="flex-1 pt-0 min-h-0">
										{renderCategories(prompt.metadata?.categories || [])}
									</CardContent>

									<CardFooter className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-[#27272A] flex-shrink-0">
										<div className="flex items-center gap-2">
											<Sparkles className="h-4 w-4" />
											<span>
												{formatDistanceToNow(new Date(prompt.created_at), {
													addSuffix: true,
													locale: vi,
												})}
											</span>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 hover:bg-muted/80"
											onClick={() => setSelectedPrompt(prompt)}>
											<ExternalLink className="h-4 w-4" />
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}

					{/* Prompt Detail Modal */}
					<PromptDetailModal
						prompt={selectedPrompt}
						isOpen={!!selectedPrompt}
						onClose={() => setSelectedPrompt(null)}
					/>
				</div>
			</main>
		</div>
	);
}
