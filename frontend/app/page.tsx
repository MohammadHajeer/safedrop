export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold tracking-tight">SafeDrop</p>
            <p className="text-sm text-muted-foreground">
              Secure temporary sharing
            </p>
          </div>

          <button className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            Sign in
          </button>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
              Private. Temporary. Controlled.
            </div>

            <h1 className="max-w-xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Share what matters.
              <span className="text-primary"> Let it disappear.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              Share sensitive text and files with expiration dates, limited
              views, and full control over access.
            </p>

            <div className="mt-8 flex gap-3">
              <button className="rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Create a Drop
              </button>

              <button className="rounded-xl border bg-card px-5 py-3 font-medium transition-colors hover:bg-accent">
                Continue as guest
              </button>
            </div>
          </div>

          {/* Visual card */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Private credentials</p>
                <p className="text-sm text-muted-foreground">
                  Created just now
                </p>
              </div>

              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                Active
              </span>
            </div>

            <div className="rounded-2xl bg-muted p-5">
              <p className="text-sm text-muted-foreground">Secure content</p>

              <div className="mt-4 space-y-3">
                <div className="h-3 w-full rounded-full bg-border" />
                <div className="h-3 w-4/5 rounded-full bg-border" />
                <div className="h-3 w-2/3 rounded-full bg-border" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">Expires in</p>
                <p className="mt-1 font-medium">2h 42m</p>
              </div>

              <div className="rounded-xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="mt-1 font-medium">1 / 5</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-24 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Controlled access"
            description="Choose exactly how many times your shared content can be opened."
          />

          <FeatureCard
            title="Automatic expiry"
            description="Your content becomes unavailable automatically when its time runs out."
          />

          <FeatureCard
            title="Stay in control"
            description="Signed-in users can manage, track, update, and revoke their shared content."
          />
        </section>

        {/* Color samples */}
        <section className="mt-24">
          <p className="mb-5 text-sm font-medium text-muted-foreground">
            SafeDrop palette
          </p>

          <div className="grid gap-3 sm:grid-cols-4">
            <ColorSample className="bg-primary" label="Primary" />
            <ColorSample className="bg-primary-soft" label="Primary soft" />
            <ColorSample className="bg-muted" label="Muted" />
            <ColorSample className="bg-card" label="Surface" bordered />
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border bg-card p-6 transition-colors hover:bg-accent/40">
      <div className="mb-5 size-10 rounded-xl bg-primary-soft" />

      <h2 className="font-semibold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

function ColorSample({
  className,
  label,
  bordered = false,
}: {
  className: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div>
      <div
        className={`h-24 rounded-2xl ${className} ${bordered ? "border" : ""}`}
      />
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
