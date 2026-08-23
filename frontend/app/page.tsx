import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="text-3xl font-semibold">SafeDrop</h1>
      <p>Authentication and routing test placeholder.</p>
      <nav className="flex flex-wrap gap-4 underline">
        <Link href="/login">Log in</Link>
        <Link href="/register">Register</Link>
        <Link href="/create">Create a guest Drop</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
    </main>
  );
}
