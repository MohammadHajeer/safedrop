import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <LoginForm nextPath={nextPath} />
      <p>
        <Link className="underline" href="/register">
          Create an account
        </Link>
      </p>
    </main>
  );
}
