import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { AuthLayout } from "@/components/public/auth-layout";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function RegisterPage() {
  return (
    <PublicShell>
      <AuthLayout
        eyebrow="Your SafeDrop account"
        title="Create your account"
        description="Get more room and manage your temporary shares in one place."
      >
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </AuthLayout>
    </PublicShell>
  );
}
