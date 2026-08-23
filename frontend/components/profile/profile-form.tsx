"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, LoaderCircleIcon, MailIcon, UserRoundIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateProfile } from "@/lib/api/profile";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { User } from "@/lib/auth-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

const schema = z.object({
  first_name: z.string().trim().min(2, "Use at least 2 characters.").max(50, "Keep the first name under 50 characters."),
  last_name: z.string().trim().min(2, "Use at least 2 characters.").max(50, "Keep the last name under 50 characters."),
});
type Values = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting, isDirty } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: user.first_name, last_name: user.last_name },
  });

  async function submit(values: Values) {
    try {
      const updated = await updateProfile({ first_name: values.first_name.trim(), last_name: values.last_name.trim() });
      reset({ first_name: updated.first_name, last_name: updated.last_name });
      toast.add({ title: "Profile updated", description: "Your name has been saved.", type: "success" });
      router.refresh();
    } catch (caught) {
      setError("root", { message: getApiErrorMessage(caught) });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="profile-first-name">First name</Label><div className="relative"><UserRoundIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="profile-first-name" className="h-11 pl-9" autoComplete="given-name" aria-invalid={Boolean(errors.first_name)} {...register("first_name")} /></div>{errors.first_name ? <p className="text-sm text-destructive">{errors.first_name.message}</p> : null}</div>
        <div className="space-y-2"><Label htmlFor="profile-last-name">Last name</Label><div className="relative"><UserRoundIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="profile-last-name" className="h-11 pl-9" autoComplete="family-name" aria-invalid={Boolean(errors.last_name)} {...register("last_name")} /></div>{errors.last_name ? <p className="text-sm text-destructive">{errors.last_name.message}</p> : null}</div>
      </div>
      <div className="space-y-2"><Label htmlFor="profile-email">Email</Label><div className="relative"><MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="profile-email" value={user.email} readOnly className="h-11 bg-muted/40 pl-9 text-muted-foreground" /></div><p className="text-xs text-muted-foreground">Email changes are not currently supported.</p></div>
      {errors.root?.message ? <Alert variant="destructive"><AlertTitle>Profile not updated</AlertTitle><AlertDescription>{errors.root.message}</AlertDescription></Alert> : null}
      <Button type="submit" size="lg" disabled={isSubmitting || !isDirty} className="h-11 rounded-full px-5">{isSubmitting ? <><LoaderCircleIcon className="animate-spin" /> Saving…</> : <><CheckIcon /> Save changes</>}</Button>
    </form>
  );
}
