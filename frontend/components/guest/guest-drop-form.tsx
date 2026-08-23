"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardIcon,
  FileIcon,
  LoaderCircleIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonAnchor } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createGuestDropWithFile,
  type CreateGuestDropResponse,
} from "@/lib/api/guest";
import { cn } from "@/lib/utils";

const GUEST_MAX_FILE_SIZE = 5 * 1024 * 1024;

const guestDropSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(100, "Keep the title under 100 characters."),
  content: z
    .string()
    .trim()
    .min(1, "Add the text you want to share.")
    .max(10_000, "Keep the message under 10,000 characters."),
  expiration: z.enum(["15", "30", "60"]),
  max_views: z.enum(["1", "2", "3"]),
});

type GuestDropValues = z.infer<typeof guestDropSchema>;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function expirationFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function GuestDropForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File>();
  const [fileError, setFileError] = useState<string>();
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<CreateGuestDropResponse>();
  const [shareUrl, setShareUrl] = useState("");
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GuestDropValues>({
    resolver: zodResolver(guestDropSchema),
    defaultValues: {
      title: "",
      content: "",
      expiration: "30",
      max_views: "1",
    },
  });

  function chooseFile(nextFile?: File) {
    setFileError(undefined);

    if (!nextFile) {
      setFile(undefined);
      return;
    }

    if (nextFile.size === 0) {
      setFileError("Choose a file that is not empty.");
      setFile(undefined);
      return;
    }

    if (nextFile.size > GUEST_MAX_FILE_SIZE) {
      setFileError("Guest attachments must be 5 MiB or smaller.");
      setFile(undefined);
      return;
    }

    if (nextFile.name.length > 255) {
      setFileError("The file name is too long.");
      setFile(undefined);
      return;
    }

    setFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 1) {
      setFileError("Guest Drops support one attachment.");
      return;
    }

    chooseFile(event.dataTransfer.files.item(0) ?? undefined);
  }

  function removeFile() {
    setFile(undefined);
    setFileError(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(values: GuestDropValues) {
    if (fileError) return;

    try {
      const created = await createGuestDropWithFile({
        drop: {
          title: values.title.trim(),
          content: values.content.trim(),
          expires_at: expirationFromNow(Number(values.expiration)),
          max_views: Number(values.max_views),
        },
        file,
      });

      setResult(created);
      setShareUrl(
        new URL(
          `/d/${encodeURIComponent(created.share_token)}`,
          window.location.origin,
        ).toString(),
      );
    } catch (caught) {
      setError("root", { message: getApiErrorMessage(caught) });
      toast.add({
        title: "Drop not created",
        description: "Review the error in the form and try again.",
        type: "error",
        priority: "high",
      });
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.add({
        title: "Share link copied",
        description: "It is ready to send to your recipient.",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Could not copy the link",
        description: "Select and copy it manually instead.",
        type: "error",
      });
    }
  }

  if (result) {
    return (
      <section aria-labelledby="drop-ready-title" className="text-center">
        <Image
          src="/illustrations/all-caught-up.webp"
          alt="A completed SafeDrop with a check mark"
          width={360}
          height={240}
          className="mx-auto h-auto w-full max-w-[260px]"
        />
        <span className="mx-auto mt-2 flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CheckIcon className="size-5" />
        </span>
        <h2
          id="drop-ready-title"
          className="mt-4 text-2xl font-semibold tracking-[-0.025em]"
        >
          Your Drop is ready
        </h2>
        <p className="mx-auto mt-2 max-w-lg leading-7 text-muted-foreground">
          Save or share this link now. It will expire automatically, and this
          guest Drop will not appear in an account dashboard.
        </p>

        <div className="mt-7 rounded-xl border bg-muted/45 p-2 text-left">
          <Label htmlFor="share-link" className="sr-only">
            Share link
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="share-link"
              readOnly
              value={shareUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="h-11 bg-card px-3 font-mono text-xs"
            />
            <Button
              type="button"
              className="h-11 shrink-0 rounded-lg px-4"
              onClick={copyShareLink}
            >
              <ClipboardIcon /> Copy link
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonAnchor
            variant="outline"
            className="h-11 rounded-full px-5"
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open recipient view
            <ArrowRightIcon data-icon="inline-end" />
          </ButtonAnchor>
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-full px-5"
            onClick={() => window.location.reload()}
          >
            Create another Drop
          </Button>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Opening the recipient view counts as one of this Drop&apos;s allowed
          views.
        </p>
      </section>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="drop-title">Title</Label>
          <span className="text-xs text-muted-foreground">
            3–100 characters
          </span>
        </div>
        <Input
          id="drop-title"
          placeholder="What are you sharing?"
          autoFocus
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "drop-title-error" : undefined}
          className="h-11 px-3"
          {...register("title")}
        />
        {errors.title ? (
          <p id="drop-title-error" className="text-sm text-destructive">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="drop-content">Message</Label>
          <span className="text-xs text-muted-foreground">
            Up to 10,000 characters
          </span>
        </div>
        <Textarea
          id="drop-content"
          placeholder="Add the text your recipient should receive…"
          rows={7}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "drop-content-error" : undefined}
          className="min-h-40 px-3 py-3 leading-6"
          {...register("content")}
        />
        {errors.content ? (
          <p id="drop-content-error" className="text-sm text-destructive">
            {errors.content.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label id="expiration-label" htmlFor="drop-expiration">
            Expires after
          </Label>
          <Controller
            control={control}
            name="expiration"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="drop-expiration"
                  aria-labelledby="expiration-label"
                  className="h-11 w-full px-3"
                >
                  <SelectValue>{(value) => `${value} minutes`}</SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label id="views-label" htmlFor="drop-views">
            View limit
          </Label>
          <Controller
            control={control}
            name="max_views"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="drop-views"
                  aria-labelledby="views-label"
                  className="h-11 w-full px-3"
                >
                  <SelectValue>
                    {(value) => `${value} ${value === "1" ? "view" : "views"}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="1">1 view</SelectItem>
                  <SelectItem value="2">2 views</SelectItem>
                  <SelectItem value="3">3 views</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <Label htmlFor="drop-file">
            Attachment{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            One file, up to 5 MiB.
          </p>
        </div>

        {file ? (
          <div className="flex items-center gap-3 rounded-xl border bg-muted/35 p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={`Remove ${file.name}`}
              onClick={removeFile}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2Icon />
            </Button>
          </div>
        ) : (
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl border border-dashed p-5 text-center transition-colors sm:p-7",
              isDragging
                ? "border-primary bg-primary-soft/55"
                : "bg-muted/25 hover:bg-muted/45",
              fileError && "border-destructive/60",
            )}
          >
            <Input
              ref={fileInputRef}
              id="drop-file"
              type="file"
              className="sr-only"
              aria-invalid={Boolean(fileError)}
              aria-describedby="drop-file-help drop-file-error"
              onChange={(event) =>
                chooseFile(event.target.files?.item(0) ?? undefined)
              }
            />
            <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <UploadCloudIcon className="size-5" />
            </span>
            <p className="mt-3 text-sm font-medium">Drop a file here</p>
            <p
              id="drop-file-help"
              className="mt-1 text-sm text-muted-foreground"
            >
              or{" "}
              <Label
                htmlFor="drop-file"
                className="inline cursor-pointer font-medium text-primary hover:underline"
              >
                browse your device
              </Label>
            </p>
          </div>
        )}
        {fileError ? (
          <p
            id="drop-file-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {fileError}
          </p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <Alert variant="destructive">
          <AlertTitle>We could not create this Drop</AlertTitle>
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      ) : null}

      {isSubmitting ? (
        <Progress value={file ? 68 : 48} aria-label="Creating Drop">
          <ProgressLabel>
            {file ? "Creating and uploading…" : "Creating secure link…"}
          </ProgressLabel>
          <span className="ml-auto text-sm text-muted-foreground">
            {file ? "Uploading directly" : "Please wait"}
          </span>
        </Progress>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-full px-6 text-base"
        disabled={isSubmitting || Boolean(fileError)}
      >
        {isSubmitting ? (
          <>
            <LoaderCircleIcon className="animate-spin" />
            Creating your Drop…
          </>
        ) : (
          <>
            Create secure link
            <ArrowRightIcon data-icon="inline-end" />
          </>
        )}
      </Button>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        Files upload directly from your browser to private object storage.
      </p>
    </form>
  );
}
