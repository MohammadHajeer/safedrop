import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function SafeDropLogo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="SafeDrop home"
      className={cn(
        "inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Image
        src="/branding/logo-full-light.png"
        alt="SafeDrop"
        width={132}
        height={44}
        className="h-auto w-[118px] dark:hidden sm:w-[132px]"
      />
      <Image
        src="/branding/logo-full-dark.png"
        alt="SafeDrop"
        width={132}
        height={44}
        className="hidden h-auto w-[118px] dark:block sm:w-[132px]"
      />
    </Link>
  );
}
