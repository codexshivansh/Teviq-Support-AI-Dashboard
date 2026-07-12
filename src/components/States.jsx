import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-3xl border border-dashed border-line bg-white/50 dark:bg-white/5">
      <div className="flex items-center gap-3 text-sm font-medium text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong." }) {
  const isAuthError = /auth|session|sign in|unauthorized/i.test(message);

  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300" role="alert">
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle className="h-4 w-4" />
        {isAuthError ? "Session needs attention" : "Could not load"}
      </div>
      <p className="mt-2 text-rose-600 dark:text-rose-300/90">
        {isAuthError ? `${message} Refresh the page or sign in again if it continues.` : message}
      </p>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white/55 p-8 text-center dark:bg-white/5">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
    </div>
  );
}
