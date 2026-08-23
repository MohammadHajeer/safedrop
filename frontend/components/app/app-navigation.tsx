"use client";

import {
  BarChart3Icon,
  CirclePlusIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PackageOpenIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { useCurrentUser } from "@/hooks/use-auth";
import { SafeDropLogo } from "@/components/public/safedrop-logo";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const accountItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  { href: "/dashboard/drops", label: "My Drops", icon: PackageOpenIcon },
  {
    href: "/dashboard/drops/new",
    label: "Create Drop",
    icon: CirclePlusIcon,
    exact: true,
  },
  { href: "/profile", label: "Profile", icon: UserRoundIcon },
];

const adminItems = [
  {
    href: "/admin",
    label: "Admin overview",
    icon: ShieldCheckIcon,
    exact: true,
  },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/stats", label: "Statistics", icon: BarChart3Icon },
];

function NavigationLinks({
  closeOnNavigate = false,
}: {
  closeOnNavigate?: boolean;
}) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  const renderItems = (items: typeof accountItems) =>
    items.map((item) => {
      const active =
        item.href === "/dashboard/drops"
          ? pathname.startsWith(item.href) &&
            pathname !== "/dashboard/drops/new"
          : item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
      const Icon = item.icon;
      const link = (
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "hover:bg-muted hover:text-foreground",
            active && "bg-primary-soft text-primary",
          )}
        >
          <Icon className="size-[18px]" />
          {item.label}
        </Link>
      );
      return closeOnNavigate ? (
        <SheetClose key={item.href} nativeButton={false} render={link} />
      ) : (
        <div key={item.href}>{link}</div>
      );
    });

  return (
    <nav aria-label="Authenticated navigation" className="space-y-1">
      {renderItems(accountItems)}
      {user?.type === "admin" ? (
        <>
          <div className="px-3 pt-5 pb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Administration
          </div>
          {renderItems(adminItems)}
        </>
      ) : null}
    </nav>
  );
}

function AccountSummary() {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) {
    return (
      <div className="space-y-3 rounded-xl border bg-muted/35 p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border bg-muted/35 p-3">
        <p className="text-sm text-muted-foreground">Account unavailable</p>
        <LogoutButton className="mt-2 h-8 w-full px-2" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/35 p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
          {user.first_name.charAt(0)}
          {user.last_name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {user.first_name} {user.last_name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          {user.type === "admin" ? (
            <p className="mt-1 text-[10px] font-semibold tracking-wide text-primary uppercase">
              Administrator
            </p>
          ) : null}
        </div>
      </div>
      <LogoutButton className="mt-2 h-8 w-full px-2" />
    </div>
  );
}

export function DesktopNavigation() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r bg-sidebar p-4 lg:flex lg:flex-col">
      <SafeDropLogo href="/dashboard" className="mx-2 mt-1" />
      <Separator className="my-5" />
      <NavigationLinks />
      <div className="mt-auto space-y-3 pt-6">
        <div className="flex items-center justify-between pl-2">
          <span className="text-xs font-medium text-muted-foreground">
            Appearance
          </span>
          <ThemeToggle />
        </div>
        <AccountSummary />
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/92 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Open navigation"
            />
          }
        >
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(86vw,340px)] p-4">
          <SheetHeader className="p-0 pr-10">
            <SheetTitle className="sr-only">SafeDrop navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate your SafeDrop account.
            </SheetDescription>
            <SafeDropLogo href="/dashboard" />
          </SheetHeader>
          <Separator />
          <NavigationLinks closeOnNavigate />
          <div className="mt-auto space-y-3">
            <AccountSummary />
          </div>
        </SheetContent>
      </Sheet>
      <SafeDropLogo href="/dashboard" className="[&_img]:w-[112px]" />
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
