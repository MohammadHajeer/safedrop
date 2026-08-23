import { requireCurrentUser } from "@/lib/server/auth";

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <main className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>{user.first_name} {user.last_name} ({user.email})</p>
      <p>Role: {user.type}</p>
    </main>
  );
}
