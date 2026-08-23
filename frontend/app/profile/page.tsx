import { LogoutButton } from "@/components/auth/logout-button";
import { requireCurrentUser } from "@/lib/server/auth";

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  return <main className="space-y-3 p-8"><h1 className="text-2xl font-semibold">Profile</h1><p>{user.first_name} {user.last_name} ({user.email})</p><LogoutButton /></main>;
}
