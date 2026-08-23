import { DesktopNavigation, MobileNavigation } from "./app-navigation";

export function AuthenticatedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:flex">
      <DesktopNavigation />
      <div className="min-w-0 flex-1">
        <MobileNavigation />
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
