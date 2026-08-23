import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/public/auth-layout";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a SafeDrop account to manage larger and longer-lived temporary shares.",
};

export default function RegisterPage() {
  return (
    <PublicShell>
      <AuthLayout
        eyebrow="Your SafeDrop account"
        title="Create your account"
        description="Get more room, longer sharing windows, and one place to manage your Drops."
      >
        <RegisterForm />

        <div className="mt-7 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            Not ready to sign up?{" "}
            <Link
              href="/create"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Continue as guest
            </Link>
          </p>
        </div>
      </AuthLayout>
    </PublicShell>
  );
}
