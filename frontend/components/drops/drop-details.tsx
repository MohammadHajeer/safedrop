"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClockIcon,
  ClipboardIcon,
  EyeIcon,
  FileIcon,
  Link2Icon,
  LoaderCircleIcon,
  PencilIcon,
  ShieldOffIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useDrop, useRevokeDrop, useUpdateDrop } from "@/hooks/use-drops";
import { getDropShareToken, type Drop, type DropFile } from "@/lib/api/drops";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatBytes, formatDateTime, relativeDate } from "@/lib/drop-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { DropStatusBadge } from "./drop-status-badge";

const editSchema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters.").max(100, "Keep the title under 100 characters."),
  content: z.string().trim().min(1, "Add a message.").max(10_000, "Keep the message under 10,000 characters."),
  max_views: z.number().int().min(1).max(100),
});
type EditValues = z.infer<typeof editSchema>;

function EditDropDialog({ drop }: { drop: Drop }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateDrop();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { title: drop.title, content: drop.content, max_views: drop.max_views },
  });

  async function submit(values: EditValues) {
    if (values.max_views < drop.view_count) {
      setError("max_views", { message: `Use at least ${drop.view_count}, the current view count.` });
      return;
    }
    try {
      await update.mutateAsync({ dropId: drop.id, input: { title: values.title.trim(), content: values.content.trim(), max_views: values.max_views } });
      setOpen(false);
      toast.add({ title: "Drop updated", description: "Your changes are now live.", type: "success" });
    } catch (caught) {
      setError("root", { message: getApiErrorMessage(caught) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="h-10" />}><PencilIcon /> Edit Drop</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>Edit Drop</DialogTitle><DialogDescription>Update the title, message, or view limit. Expiration and files cannot be changed.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div className="space-y-2"><Label htmlFor="edit-title">Title</Label><Input id="edit-title" className="h-10" aria-invalid={Boolean(errors.title)} {...register("title")} />{errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}</div>
          <div className="space-y-2"><Label htmlFor="edit-content">Message</Label><Textarea id="edit-content" rows={7} className="min-h-36" aria-invalid={Boolean(errors.content)} {...register("content")} />{errors.content ? <p className="text-sm text-destructive">{errors.content.message}</p> : null}</div>
          <div className="space-y-2"><Label htmlFor="edit-max-views">View limit</Label><Input id="edit-max-views" type="number" min={Math.max(1, drop.view_count)} max={100} className="h-10" aria-invalid={Boolean(errors.max_views)} {...register("max_views", { valueAsNumber: true })} />{errors.max_views ? <p className="text-sm text-destructive">{errors.max_views.message}</p> : <p className="text-xs text-muted-foreground">Cannot be lower than the current {drop.view_count} views.</p>}</div>
          {errors.root?.message ? <Alert variant="destructive"><AlertTitle>Drop not updated</AlertTitle><AlertDescription>{errors.root.message}</AlertDescription></Alert> : null}
          <DialogFooter className="mt-5">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><LoaderCircleIcon className="animate-spin" /> Saving…</> : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RevokeDropDialog({ dropId }: { dropId: string }) {
  const revoke = useRevokeDrop();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  async function confirm() {
    setError(undefined);
    try {
      await revoke.mutateAsync(dropId);
      setOpen(false);
      toast.add({ title: "Drop revoked", description: "Recipients can no longer open it through SafeDrop.", type: "success" });
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" className="h-10" />}><ShieldOffIcon /> Revoke</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive"><ShieldOffIcon /></AlertDialogMedia>
          <AlertDialogTitle>Revoke this Drop?</AlertDialogTitle>
          <AlertDialogDescription>Recipients will no longer be able to access it through SafeDrop. A temporary storage URL already issued before revocation may remain valid until that URL expires.</AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={revoke.isPending}>Keep Drop</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm} disabled={revoke.isPending}>{revoke.isPending ? "Revoking…" : "Revoke Drop"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ShareLink({ dropId }: { dropId: string }) {
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function reveal() {
    setLoading(true);
    try {
      const token = await getDropShareToken(dropId);
      setShareUrl(new URL(`/d/${encodeURIComponent(token)}`, window.location.origin).toString());
    } catch (caught) {
      toast.add({ title: "Share link unavailable", description: getApiErrorMessage(caught), type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.add({ title: "Share link copied", description: "It is ready to send.", type: "success" });
    } catch {
      toast.add({ title: "Could not copy the link", description: "Select and copy it manually.", type: "error" });
    }
  }

  return shareUrl ? (
    <div className="flex flex-col gap-2 sm:flex-row"><Input readOnly value={shareUrl} aria-label="Share link" onFocus={(event) => event.currentTarget.select()} className="h-10 bg-background font-mono text-xs" /><Button type="button" onClick={copy} className="h-10 shrink-0"><ClipboardIcon /> Copy</Button></div>
  ) : <Button type="button" variant="outline" onClick={reveal} disabled={loading} className="h-10">{loading ? <LoaderCircleIcon className="animate-spin" /> : <Link2Icon />} {loading ? "Recovering link…" : "Show share link"}</Button>;
}

export function DropDetails({ initialDrop, files }: { initialDrop: Drop; files: DropFile[] }) {
  const query = useDrop(initialDrop.id, initialDrop);
  const drop = query.data ?? initialDrop;
  const canEdit = drop.status === "active" || drop.status === "consumed";
  const canRevoke = drop.status !== "revoked";
  const viewPercent = Math.min((drop.view_count / drop.max_views) * 100, 100);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3"><DropStatusBadge status={drop.status} /><span className="text-xs text-muted-foreground">Created {relativeDate(drop.created_at)}</span></div>
          <h1 className="mt-3 break-words text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{drop.title}</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">ID {drop.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">{canEdit ? <EditDropDialog drop={drop} /> : null}{canRevoke ? <RevokeDropDialog dropId={drop.id} /> : null}</div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.72fr)]">
        <div className="space-y-5">
          <Card className="gap-3 p-1 shadow-none ring-border">
            <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6"><CardTitle>Recipient message</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6"><div className="whitespace-pre-wrap rounded-xl border bg-muted/25 p-4 leading-7 sm:p-5">{drop.content}</div></CardContent>
          </Card>
          <Card className="gap-3 p-1 shadow-none ring-border">
            <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6"><CardTitle>Attachments</CardTitle><p className="text-sm text-muted-foreground">Finalized files on this Drop. Owner download links are not issued here.</p></CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              {files.length ? <ul className="divide-y rounded-xl border">{files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 p-3 sm:p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><FileIcon className="size-5" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.original_name}</p><p className="mt-1 text-xs text-muted-foreground">{file.content_type} · {formatBytes(file.size_bytes)}</p></div><span className="hidden text-xs text-muted-foreground sm:block">Uploaded {relativeDate(file.uploaded_at)}</span></li>
              ))}</ul> : <div className="rounded-xl border border-dashed bg-muted/20 px-5 py-8 text-center"><FileIcon className="mx-auto size-6 text-muted-foreground" /><p className="mt-2 text-sm font-medium">No attachments</p><p className="mt-1 text-xs text-muted-foreground">This Drop contains a message only.</p></div>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="gap-4 p-5 shadow-none ring-border sm:p-6">
            <CardTitle>Access</CardTitle>
            <div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2 font-medium"><EyeIcon className="size-4 text-primary" /> Recipient views</span><span className="tabular-nums text-muted-foreground">{drop.view_count} / {drop.max_views}</span></div><Progress value={viewPercent} aria-label={`${drop.view_count} of ${drop.max_views} views used`} /></div>
            <Separator />
            <div className="flex gap-3"><CalendarClockIcon className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">Expiration</p><p className="mt-1 text-sm text-muted-foreground">{formatDateTime(drop.expires_at)}</p></div></div>
            {drop.last_accessed_at ? <div className="flex gap-3"><EyeIcon className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">Last opened</p><p className="mt-1 text-sm text-muted-foreground">{formatDateTime(drop.last_accessed_at)}</p></div></div> : null}
          </Card>
          <Card className="gap-4 p-5 shadow-none ring-border sm:p-6"><CardTitle>Share link</CardTitle><p className="text-sm leading-6 text-muted-foreground">Recover the owner-held link when you need to send it again.</p>{drop.status === "active" ? <ShareLink dropId={drop.id} /> : <Alert><AlertTitle>Link is inactive</AlertTitle><AlertDescription>This Drop is {drop.status} and recipient access is no longer available.</AlertDescription></Alert>}</Card>
          <ButtonLink href="/dashboard/drops" variant="ghost" className="w-full">Back to My Drops</ButtonLink>
        </div>
      </div>
    </div>
  );
}
