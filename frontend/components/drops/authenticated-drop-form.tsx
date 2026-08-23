"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClipboardIcon,
  FileIcon,
  LoaderCircleIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useCreateDrop } from "@/hooks/use-drops";
import {
  DropUploadError,
  MAX_DROP_FILE_SIZE,
  MAX_FILES_PER_DROP,
  MAX_FILE_SIZE,
  validateDropFiles,
  type CreateDropResponse,
  type UploadProgress,
} from "@/lib/api/drops";
import { getApiErrorMessage } from "@/lib/api/errors";
import { formatBytes, formatDateTime } from "@/lib/drop-utils";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

const schema = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters.").max(100, "Keep the title under 100 characters."),
  content: z.string().trim().min(1, "Add the text you want to share.").max(10_000, "Keep the message under 10,000 characters."),
  expiration: z.enum(["1h", "1d", "7d", "30d"]),
  max_views: z.number().int().min(1, "Allow at least one view.").max(100, "The maximum is 100 views."),
});

type Values = z.infer<typeof schema>;

const expirationLabels = { "1h": "1 hour", "1d": "1 day", "7d": "7 days", "30d": "30 days" } as const;

function expiresFromNow(value: Values["expiration"]) {
  const durations = { "1h": 60 * 60_000, "1d": 24 * 60 * 60_000, "7d": 7 * 24 * 60 * 60_000, "30d": 30 * 24 * 60 * 60_000 };
  return new Date(Date.now() + durations[value]).toISOString();
}

function fileTypeLabel(file: File) {
  if (file.type) return file.type.split("/")[1]?.toUpperCase() || file.type;
  const extension = file.name.split(".").pop();
  return extension && extension !== file.name ? extension.toUpperCase() : "FILE";
}

export function AuthenticatedDropForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const createMutation = useCreateDrop();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>();
  const [result, setResult] = useState<CreateDropResponse>();
  const [shareUrl, setShareUrl] = useState("");
  const [partialFailure, setPartialFailure] = useState<DropUploadError>();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "", expiration: "1d", max_views: 5 },
  });
  const expiration = useWatch({ control, name: "expiration" });
  const totalSize = files.reduce((total, file) => total + file.size, 0);

  function addFiles(incoming: File[]) {
    setFileError(undefined);
    const next = [...files, ...incoming];
    try {
      validateDropFiles(next);
      setFiles(next);
    } catch (caught) {
      setFileError(getApiErrorMessage(caught));
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setFileError(undefined);
  }

  async function onSubmit(values: Values) {
    if (fileError) return;
    setPartialFailure(undefined);
    setProgress(undefined);
    try {
      const created = await createMutation.mutateAsync({
        drop: {
          title: values.title.trim(),
          content: values.content.trim(),
          expires_at: expiresFromNow(values.expiration),
          max_views: values.max_views,
        },
        files,
        onProgress: setProgress,
      });
      setResult(created);
      setShareUrl(new URL(`/d/${encodeURIComponent(created.share_token)}`, window.location.origin).toString());
      toast.add({ title: "Drop created", description: files.length ? "Every attachment finished uploading." : "Your temporary link is ready.", type: "success" });
    } catch (caught) {
      if (caught instanceof DropUploadError) {
        setPartialFailure(caught);
        setError("root", { message: caught.message });
      } else {
        setError("root", { message: getApiErrorMessage(caught) });
      }
      toast.add({ title: "Drop not fully created", description: "Review the error in the form before continuing.", type: "error", priority: "high" });
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.add({ title: "Share link copied", description: "It is ready to send.", type: "success" });
    } catch {
      toast.add({ title: "Could not copy the link", description: "Select and copy it manually instead.", type: "error" });
    }
  }

  if (result) {
    return (
      <section aria-labelledby="created-title" className="text-center">
        <Image src="/illustrations/all-caught-up.webp" alt="A completed SafeDrop with a check mark" width={360} height={240} className="mx-auto h-auto w-full max-w-[240px]" />
        <span className="mx-auto mt-2 flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary"><CheckCircle2Icon className="size-5" /></span>
        <h2 id="created-title" className="mt-4 text-2xl font-semibold tracking-tight">Your Drop is ready</h2>
        <p className="mx-auto mt-2 max-w-lg leading-7 text-muted-foreground">The Drop and all {files.length || "selected"} {files.length === 1 ? "attachment" : "attachments"} completed successfully.</p>
        <div className="mt-6 rounded-xl border bg-muted/35 p-2 text-left">
          <Label htmlFor="created-share-link" className="sr-only">Share link</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="created-share-link" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} className="h-11 bg-card font-mono text-xs" />
            <Button type="button" onClick={copyLink} className="h-11 shrink-0"><ClipboardIcon /> Copy link</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span>Expires {formatDateTime(result.expires_at)}</span>
          <span>{result.max_views} view limit</span>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={`/dashboard/drops/${result.id}`} className="h-11 rounded-full px-5">Manage Drop <ArrowRightIcon data-icon="inline-end" /></ButtonLink>
          <ButtonAnchor href={shareUrl} target="_blank" rel="noreferrer" variant="outline" className="h-11 rounded-full px-5">Open recipient view</ButtonAnchor>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Opening the recipient view counts toward the view limit.</p>
      </section>
    );
  }

  const fileProgress = progress?.stage === "uploading" && progress.totalFiles
    ? (progress.completedFiles / progress.totalFiles) * 100
    : progress?.stage === "complete" ? 100 : 0;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4"><Label htmlFor="auth-drop-title">Title</Label><span className="text-xs text-muted-foreground">3–100 characters</span></div>
        <Input id="auth-drop-title" autoFocus placeholder="What are you sharing?" className="h-11 px-3" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "auth-drop-title-error" : undefined} {...register("title")} />
        {errors.title ? <p id="auth-drop-title-error" className="text-sm text-destructive">{errors.title.message}</p> : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4"><Label htmlFor="auth-drop-content">Message</Label><span className="text-xs text-muted-foreground">Up to 10,000 characters</span></div>
        <Textarea id="auth-drop-content" rows={8} placeholder="Add the text your recipient should receive…" className="min-h-44 px-3 py-3 leading-6" aria-invalid={Boolean(errors.content)} aria-describedby={errors.content ? "auth-drop-content-error" : undefined} {...register("content")} />
        {errors.content ? <p id="auth-drop-content-error" className="text-sm text-destructive">{errors.content.message}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label id="auth-expiration-label">Expires after</Label>
          <Controller control={control} name="expiration" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-labelledby="auth-expiration-label" className="h-11 w-full px-3"><SelectValue /></SelectTrigger>
              <SelectContent align="start">
                {Object.entries(expirationLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
          <p className="text-xs text-muted-foreground">Up to 30 days for account Drops.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth-max-views">View limit</Label>
          <Input id="auth-max-views" type="number" min={1} max={100} className="h-11 px-3" aria-invalid={Boolean(errors.max_views)} {...register("max_views", { valueAsNumber: true })} />
          {errors.max_views ? <p className="text-xs text-destructive">{errors.max_views.message}</p> : <p className="text-xs text-muted-foreground">Between 1 and 100 recipient views.</p>}
        </div>
      </div>
      <Separator />
      <section className="space-y-3" aria-labelledby="attachments-title">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><Label id="attachments-title" htmlFor="auth-drop-files">Attachments <span className="font-normal text-muted-foreground">(optional)</span></Label><p className="mt-1 text-sm text-muted-foreground">Up to {MAX_FILES_PER_DROP} files, {formatBytes(MAX_FILE_SIZE)} each, {formatBytes(MAX_DROP_FILE_SIZE)} total.</p></div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{files.length}/{MAX_FILES_PER_DROP} · {formatBytes(totalSize)}</span>
        </div>
        <div
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn("rounded-xl border border-dashed p-5 text-center transition-colors sm:p-6", dragging ? "border-primary bg-primary-soft/50" : "bg-muted/25 hover:bg-muted/45", fileError && "border-destructive/60")}
        >
          <Input ref={inputRef} id="auth-drop-files" type="file" multiple className="sr-only" aria-invalid={Boolean(fileError)} aria-describedby="auth-drop-files-help auth-drop-files-error" onChange={(event) => addFiles(Array.from(event.target.files ?? []))} />
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><UploadCloudIcon className="size-5" /></span>
          <p className="mt-3 text-sm font-medium">Drop files here</p>
          <p id="auth-drop-files-help" className="mt-1 text-sm text-muted-foreground">or <Label htmlFor="auth-drop-files" className="inline cursor-pointer font-medium text-primary hover:underline">browse your device</Label></p>
        </div>
        {fileError ? <p id="auth-drop-files-error" role="alert" className="text-sm text-destructive">{fileError}</p> : null}
        {files.length ? (
          <ul className="space-y-2" aria-label="Selected attachments">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-xl border bg-muted/25 p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><FileIcon className="size-5" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{fileTypeLabel(file)} · {formatBytes(file.size)}</p></div>
                <Button type="button" variant="ghost" size="icon-lg" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)} disabled={isSubmitting} className="text-muted-foreground hover:text-destructive"><Trash2Icon /></Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      {errors.root?.message ? (
        <Alert variant="destructive">
          <AlertTitle>{partialFailure ? "Drop created with an incomplete upload" : "We could not create this Drop"}</AlertTitle>
          <AlertDescription>
            <p>{errors.root.message}</p>
            {partialFailure ? <p>{partialFailure.completedFiles} of {files.length} files completed. The Drop still exists; review or revoke it before sharing.</p> : null}
            {partialFailure ? <ButtonLink href={`/dashboard/drops/${partialFailure.drop.id}`} variant="outline" className="mt-3">Manage partial Drop</ButtonLink> : null}
          </AlertDescription>
        </Alert>
      ) : null}
      {isSubmitting && progress ? (
        <div className="rounded-xl border bg-muted/30 p-4" role="status" aria-live="polite">
          {files.length ? (
            <Progress value={fileProgress} aria-label="Completed file uploads">
              <ProgressLabel>{progress.stage === "creating" ? "Creating secure Drop…" : progress.stage === "uploading" ? `Uploading ${progress.file.name}` : "Finalizing…"}</ProgressLabel>
              <span className="ml-auto text-sm text-muted-foreground">{progress.stage === "uploading" ? `${progress.completedFiles} of ${progress.totalFiles} complete` : "Please wait"}</span>
            </Progress>
          ) : <p className="flex items-center gap-2 text-sm font-medium"><LoaderCircleIcon className="size-4 animate-spin text-primary" /> Creating secure link…</p>}
        </div>
      ) : null}
      <Button type="submit" size="lg" disabled={isSubmitting || Boolean(fileError)} className="h-12 w-full rounded-full px-6 text-base">
        {isSubmitting ? <><LoaderCircleIcon className="animate-spin" /> Creating Drop…</> : <>Create secure link <ArrowRightIcon data-icon="inline-end" /></>}
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">Files upload directly from your browser to private object storage. Selected expiration: {expirationLabels[expiration]}.</p>
    </form>
  );
}
