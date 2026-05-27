type PhotoPlaceholderProps = {
  label: string;
  className?: string;
};

export function PhotoPlaceholder({ label, className }: PhotoPlaceholderProps) {
  return (
    <div
      className={`flex aspect-[4/3] min-h-64 items-end rounded-lg border border-border bg-[linear-gradient(135deg,var(--muted),var(--secondary),var(--accent))] p-5 text-sm font-medium text-primary shadow-sm ${className ?? ""}`}
      role="img"
      aria-label={label}
    >
      <span className="max-w-xs rounded-md bg-background/85 px-3 py-2 text-foreground">
        Real Lux client photography placeholder
      </span>
    </div>
  );
}
