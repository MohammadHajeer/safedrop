import type { VariantProps } from "class-variance-authority";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonStyleProps = VariantProps<typeof buttonVariants>;

function ButtonLink({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof Link> & ButtonStyleProps) {
  return (
    <Link
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

function ButtonAnchor({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"a"> & ButtonStyleProps) {
  return (
    <a
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { ButtonAnchor, ButtonLink };
