"use client";

import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
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

export default function AdminPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		async function fetchUsers() {
			try {
				const response = await fetch("/api/admin/users");
				if (!response.ok) {
					if (response.status === 403) {
						// Redirect to access denied page if not authorized
						router.push("/auth/access-denied");
						return;
					}
					throw new Error("Failed to fetch users");
				}
				const data = await response.json();
				setUsers(data.users);
			} catch (error) {
				console.error("Error fetching users:", error);
				toast({
					title: "Error",
					description: "Failed to load users. Please try again.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		fetchUsers();
	}, [router, toast]);

	const updateUserStatus = async (
		userId: string,
		status: "pending" | "verified" | "rejected"
	) => {
		try {
			const response = await fetch("/api/admin/users/status", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId, status }),
			});

			if (!response.ok) {
				throw new Error("Failed to update user status");
			}

			// Update local state
			setUsers(
				users.map((user) => (user.id === userId ? { ...user, status } : user))
			);

			toast({
				title: "Success",
				description: `User status updated to ${status}`,
			});
		} catch (error) {
			console.error("Error updating user status:", error);
			toast({
				title: "Error",
				description: "Failed to update user status",
				variant: "destructive",
			});
		}
	};

	const updateUserRole = async (userId: string, role: "user" | "admin") => {
		try {
			const response = await fetch("/api/admin/users/role", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId, role }),
			});

			if (!response.ok) {
				throw new Error("Failed to update user role");
			}

			// Update local state
			setUsers(
				users.map((user) => (user.id === userId ? { ...user, role } : user))
			);

			toast({
				title: "Success",
				description: `User role updated to ${role}`,
			});
		} catch (error) {
			console.error("Error updating user role:", error);
			toast({
				title: "Error",
				description: "Failed to update user role",
				variant: "destructive",
			});
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "verified":
				return <Badge className="bg-green-500">Verified</Badge>;
			case "rejected":
				return <Badge className="bg-red-500">Rejected</Badge>;
			case "pending":
			default:
				return <Badge className="bg-yellow-500">Pending</Badge>;
		}
	};

	const getRoleBadge = (role: string) => {
		switch (role) {
			case "admin":
				return <Badge className="bg-purple-500">Admin</Badge>;
			case "user":
			default:
				return <Badge>User</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="container py-10">
				<h1 className="text-2xl font-bold mb-6">User Management</h1>
				<div className="flex items-center justify-center p-8">
					<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="container py-10">
			<h1 className="text-2xl font-bold mb-6">User Management</h1>

			{users.length === 0 ? (
				<div className="text-center p-8 border rounded-md">
					<p className="text-muted-foreground">No users found</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Provider</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										<div className="flex items-center space-x-2">
											{user.image && (
												<img
													src={user.image}
													alt={user.name || user.email}
													className="h-8 w-8 rounded-full"
												/>
											)}
											<span>{user.name || "No name"}</span>
										</div>
									</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.provider}</TableCell>
									<TableCell>{getStatusBadge(user.status)}</TableCell>
									<TableCell>{getRoleBadge(user.role)}</TableCell>
									<TableCell>
										{new Date(user.created_at).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<div className="flex flex-col space-y-2">
											<Select
												defaultValue={user.status}
												onValueChange={(value) =>
													updateUserStatus(user.id, value as any)
												}>
												<SelectTrigger className="w-[140px]">
													<SelectValue placeholder="Status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="pending">Pending</SelectItem>
													<SelectItem value="verified">Verify</SelectItem>
													<SelectItem value="rejected">Reject</SelectItem>
												</SelectContent>
											</Select>

											<Select
												defaultValue={user.role}
												onValueChange={(value) =>
													updateUserRole(user.id, value as any)
												}>
												<SelectTrigger className="w-[140px]">
													<SelectValue placeholder="Role" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="user">User</SelectItem>
													<SelectItem value="admin">Admin</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
