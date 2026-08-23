import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return <main className="mx-auto max-w-md space-y-6 p-8"><h1 className="text-2xl font-semibold">Register</h1><RegisterForm /><p><Link className="underline" href="/login">Already registered? Log in</Link></p></main>;
}
