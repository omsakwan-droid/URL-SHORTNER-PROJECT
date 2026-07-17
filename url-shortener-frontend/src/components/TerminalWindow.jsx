export default function TerminalWindow({ title, children, className = '' }) {
  return (
    <div
      className={`w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-panel-raised)]">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-amber)]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-mint)]/70" />
        <span className="ml-3 text-xs text-[var(--color-text-dim)] tracking-wide select-none">
          {title}
        </span>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </div>
  )
}
