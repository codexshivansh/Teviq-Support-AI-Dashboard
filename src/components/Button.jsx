export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
    secondary: "border border-line bg-white/80 text-ink hover:bg-white",
    danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
