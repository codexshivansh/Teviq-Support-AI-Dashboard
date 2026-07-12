import { motion } from "framer-motion";

export function Card({ children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`rounded-3xl border border-white/70 bg-panel p-5 shadow-card backdrop-blur-xl dark:border-white/10 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function MetricCard({ icon: Icon, label, value, detail, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-900 text-white",
    green: "bg-emerald-600 text-white",
    amber: "bg-amber-500 text-white",
    blue: "bg-blue-600 text-white",
    rose: "bg-rose-600 text-white"
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          {detail ? <p className="mt-2 text-xs font-medium text-muted">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className={`grid h-10 w-10 place-items-center rounded-2xl ${tones[tone] || tones.slate}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
