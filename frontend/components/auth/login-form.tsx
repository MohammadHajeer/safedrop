"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authKeys } from "@/hooks/use-auth";
import { login } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const requestedPath = searchParams.get("next");
  const nextPath =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/dashboard";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const response = await login(values);
      queryClient.setQueryData(authKeys.me, response.user);
      router.replace(nextPath);
      router.refresh();
    } catch (caught) {
      setError("root", { message: getApiErrorMessage(caught) });
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          autoFocus
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          className="h-11 px-3"
          {...register("email")}
        />
        {errors.email ? (
          <p id="login-email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          className="h-11 px-3"
          {...register("password")}
        />
        {errors.password ? (
          <p id="login-password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <Alert variant="destructive">
          <AlertTitle>We could not sign you in</AlertTitle>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full rounded-full px-5"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <LoaderCircleIcon className="animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRightIcon data-icon="inline-end" />
          </>
        )}
      </Button>
    </form>
  );
}
