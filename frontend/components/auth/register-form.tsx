"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

const registerSchema = z.object({
  first_name: z.string().trim().min(2, "Use at least 2 characters.").max(50),
  last_name: z.string().trim().min(2, "Use at least 2 characters.").max(50),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer."),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { first_name: "", last_name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      await register(values);
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError("root", { message: getApiErrorMessage(caught) });
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="register-first-name">First name</Label>
          <Input
            id="register-first-name"
            autoComplete="given-name"
            autoFocus
            aria-invalid={Boolean(errors.first_name)}
            aria-describedby={errors.first_name ? "register-first-name-error" : undefined}
            className="h-11 px-3"
            {...registerField("first_name")}
          />
          {errors.first_name ? (
            <p id="register-first-name-error" className="text-sm text-destructive">
              {errors.first_name.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-last-name">Last name</Label>
          <Input
            id="register-last-name"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.last_name)}
            aria-describedby={errors.last_name ? "register-last-name-error" : undefined}
            className="h-11 px-3"
            {...registerField("last_name")}
          />
          {errors.last_name ? (
            <p id="register-last-name-error" className="text-sm text-destructive">
              {errors.last_name.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email address</Label>
        <Input
          id="register-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          className="h-11 px-3"
          {...registerField("email")}
        />
        {errors.email ? (
          <p id="register-email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby="register-password-description register-password-error"
          className="h-11 px-3"
          {...registerField("password")}
        />
        <p id="register-password-description" className="text-sm text-muted-foreground">
          Use at least 8 characters.
        </p>
        {errors.password ? (
          <p id="register-password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <Alert variant="destructive">
          <AlertTitle>We could not create your account</AlertTitle>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" className="h-11 w-full rounded-full px-5" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircleIcon className="animate-spin" />
            Creating account…
          </>
        ) : (
          <>
            Create account
            <ArrowRightIcon data-icon="inline-end" />
          </>
        )}
      </Button>
    </form>
  );
}
