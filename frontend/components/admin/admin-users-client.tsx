"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUserFormDialog } from "@/components/admin/admin-user-form-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { useAdminUsers, useDeleteAdminUser } from "@/hooks/use-admin";
import type { AdminUser } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";

const PAGE_SIZE = 10;

export function AdminUsersSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading users management">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-[520px] rounded-2xl" />
    </div>
  );
}

function UserRoleBadge({ type }: { type: AdminUser["type"] }) {
  return (
    <Badge variant={type === "admin" ? "default" : "secondary"}>
      {type === "admin" ? "Administrator" : "Client"}
    </Badge>
  );
}

function UserActions({
  user,
  onEdit,
  onDelete,
}: {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
        <PencilIcon /> Edit
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        aria-label={`Deactivate ${user.first_name} ${user.last_name}`}
        onClick={() => onDelete(user)}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}

export function AdminUsersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const search = searchParams.get("search")?.slice(0, 100) ?? "";
  const rawType = searchParams.get("type");
  const userType =
    rawType === "admin" || rawType === "client" ? rawType : undefined;
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const users = useAdminUsers({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    user_type: userType,
  });
  const deleteUser = useDeleteAdminUser();

  function updateParams(changes: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = new FormData(event.currentTarget as HTMLFormElement)
      .get("search")
      ?.toString()
      .trim();
    updateParams({ search: value || undefined, page: undefined });
  }

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deletingUser) return;
    try {
      await deleteUser.mutateAsync(deletingUser.id);
      toast.add({
        title: "User deactivated",
        description: `${deletingUser.first_name} ${deletingUser.last_name} can no longer sign in. The account was soft-deleted.`,
        type: "success",
      });
      if (users.data?.items.length === 1 && page > 1) {
        updateParams({ page: String(page - 1) });
      }
      setDeletingUser(null);
    } catch (caught) {
      toast.add({
        title: "User not deactivated",
        description: getApiErrorMessage(caught),
        type: "error",
      });
    }
  }

  const totalPages = Math.max(
    Math.ceil((users.data?.total ?? 0) / PAGE_SIZE),
    1,
  );

  return (
    <div className="space-y-8" aria-busy={users.isFetching}>
      <AdminPageHeader
        eyebrow="Users"
        title="Users management"
        description="Manage active client and administrator accounts through SafeDrop's protected admin controls."
        icon={UsersIcon}
        action={
          <Button onClick={openCreate} className="h-11 rounded-full px-5">
            <UserPlusIcon /> Create user
          </Button>
        }
      />

      <section
        aria-label="User filters"
        className="flex flex-col gap-3 sm:flex-row"
      >
        <form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              key={search}
              name="search"
              defaultValue={search}
              placeholder="Search by name or email…"
              aria-label="Search users"
              className="h-10 pl-9"
              maxLength={100}
            />
          </div>
          <Button type="submit" variant="outline" className="h-10">
            Search
          </Button>
        </form>
        <Select
          value={userType ?? "all"}
          onValueChange={(value) =>
            updateParams({
              type: value && value !== "all" ? value : undefined,
              page: undefined,
            })
          }
        >
          <SelectTrigger
            className="h-10 w-full sm:w-44"
            aria-label="Filter by role"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="admin">Administrators</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {!users.data ? (
        users.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Users could not be loaded</AlertTitle>
            <AlertDescription>
              Check the API connection and try again.
            </AlertDescription>
          </Alert>
        ) : (
          <AdminUsersSkeleton />
        )
      ) : (
        <Card className="gap-0 overflow-hidden p-0 shadow-none ring-border">
          {users.data.items.length ? (
            <>
              <div
                className={
                  users.isPlaceholderData
                    ? "opacity-65 transition-opacity"
                    : "transition-opacity"
                }
              >
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/35 hover:bg-muted/35">
                        <TableHead className="h-11 px-5">User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="pr-5 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.items.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                                {user.first_name.charAt(0)}
                                {user.last_name.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium">
                                  {user.first_name} {user.last_name}
                                </p>
                                <p className="mt-0.5 max-w-[280px] truncate text-xs text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <UserRoleBadge type={user.type} />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <time dateTime={user.created_at}>
                              {new Date(user.created_at).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </time>
                          </TableCell>
                          <TableCell className="pr-5">
                            <UserActions
                              user={user}
                              onEdit={openEdit}
                              onDelete={setDeletingUser}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ul className="divide-y md:hidden">
                  {users.data.items.map((user) => (
                    <li key={user.id} className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                          {user.first_name.charAt(0)}
                          {user.last_name.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="mt-1 break-all text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <UserRoleBadge type={user.type} />
                            <span className="text-xs text-muted-foreground">
                              Joined{" "}
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 border-t pt-3">
                        <UserActions
                          user={user}
                          onEdit={openEdit}
                          onDelete={setDeletingUser}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-muted-foreground">
                  {users.data.total.toLocaleString()}{" "}
                  {users.data.total === 1 ? "user" : "users"} · Page {page} of{" "}
                  {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || users.isPlaceholderData}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    <ChevronLeftIcon /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || users.isPlaceholderData}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Next <ChevronRightIcon data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="px-6 py-12 text-center">
              <Image
                src="/illustrations/empty-state.webp"
                alt="No matching users"
                width={300}
                height={200}
                className="mx-auto h-auto w-full max-w-[210px]"
              />
              <h2 className="mt-4 text-lg font-semibold">No users found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {search || userType
                  ? "Try a broader search or clear the role filter."
                  : "No manageable user accounts are available yet."}
              </p>
              {search || userType ? (
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    updateParams({
                      search: undefined,
                      type: undefined,
                      page: undefined,
                    });
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </CardContent>
          )}
        </Card>
      )}

      <AdminUserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
      />
      <AlertDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => {
          if (!open && !deleteUser.isPending) setDeletingUser(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Deactivate this user?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser
                ? `${deletingUser.first_name} ${deletingUser.last_name} will be soft-deleted and their refresh sessions revoked. This is not a permanent database erase.`
                : "The account will be soft-deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={confirmDelete}
            >
              {deleteUser.isPending ? (
                <>
                  <LoaderCircleIcon className="animate-spin" /> Deactivating…
                </>
              ) : (
                "Deactivate user"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
