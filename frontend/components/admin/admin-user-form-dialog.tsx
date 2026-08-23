"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, UserPlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useCreateAdminUser, useUpdateAdminUser } from "@/hooks/use-admin";
import type { AdminUser } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";

const userSchema = z.object({
  first_name: z.string().trim().min(2, "Use at least 2 characters.").max(50),
  last_name: z.string().trim().min(2, "Use at least 2 characters.").max(50),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .max(128, "Password must be 128 characters or fewer.")
    .optional(),
  type: z.enum(["client", "admin"]),
});

type UserValues = z.infer<typeof userSchema>;

function defaults(user: AdminUser | null): UserValues {
  return {
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    password: "",
    type: user?.type ?? "client",
  };
}

export function AdminUserFormDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
}) {
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const editing = Boolean(user);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaults(user),
  });

  useEffect(() => {
    if (open) reset(defaults(user));
  }, [open, reset, user]);

  async function submit(values: UserValues) {
    if (!editing && (!values.password || values.password.length < 8)) {
      setError("password", { message: "Use at least 8 characters." });
      return;
    }

    try {
      if (user) {
        await updateUser.mutateAsync({
          userId: user.id,
          input: {
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            email: values.email.trim(),
            type: values.type,
          },
        });
        toast.add({
          title: "User updated",
          description: `${values.first_name.trim()} ${values.last_name.trim()}'s account has been saved.`,
          type: "success",
        });
      } else {
        await createUser.mutateAsync({
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          email: values.email.trim(),
          password: values.password ?? "",
          type: values.type,
        });
        toast.add({
          title: "User created",
          description: `The ${values.type} account is ready.`,
          type: "success",
        });
      }
      onOpenChange(false);
    } catch (caught) {
      setError("root", { message: getApiErrorMessage(caught) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the account profile and SafeDrop role."
              : "Create a client or administrator through the protected admin API."}
          </DialogDescription>
        </DialogHeader>
        <form id="admin-user-form" onSubmit={handleSubmit(submit)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-user-first-name">First name</Label>
              <Input
                id="admin-user-first-name"
                autoComplete="given-name"
                aria-invalid={Boolean(errors.first_name)}
                className="h-10"
                {...register("first_name")}
              />
              {errors.first_name ? (
                <p className="text-sm text-destructive">
                  {errors.first_name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-user-last-name">Last name</Label>
              <Input
                id="admin-user-last-name"
                autoComplete="family-name"
                aria-invalid={Boolean(errors.last_name)}
                className="h-10"
                {...register("last_name")}
              />
              {errors.last_name ? (
                <p className="text-sm text-destructive">
                  {errors.last_name.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="admin-user-email">Email address</Label>
            <Input
              id="admin-user-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              className="h-10"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          {!editing ? (
            <div className="mt-4 space-y-2">
              <Label htmlFor="admin-user-password">Temporary password</Label>
              <Input
                id="admin-user-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                className="h-10"
                {...register("password")}
              />
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters.
              </p>
              {errors.password ? (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-4 space-y-2">
            <Label htmlFor="admin-user-role">Role</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="admin-user-role" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              Administrators can access protected user and platform controls.
            </p>
          </div>
          {errors.root?.message ? (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>User not saved</AlertTitle>
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          ) : null}
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="admin-user-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircleIcon className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <UserPlusIcon /> {editing ? "Save changes" : "Create user"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
