import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl text-primary">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to the Lux Collective admin area.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/subscribers"
          className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/40"
        >
          <p className="text-sm font-semibold text-primary">Newsletter</p>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage subscribers.
          </p>
        </Link>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary">Blog</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Write and publish posts. Coming soon.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary">Contact Inbox</p>
          <p className="mt-1 text-sm text-muted-foreground">
            View contact form submissions. Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
