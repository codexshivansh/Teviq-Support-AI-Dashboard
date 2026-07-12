import { motion } from "framer-motion";

// Workspace/brand switching lives in exactly one place — the sidebar's
// WorkspaceSelector (see components/Layout.jsx). PageHeader used to render
// its own second BrandSelector on every page (and Layout rendered a third,
// compact one in the top admin bar), so switching brands showed three
// separate dropdowns at once. brandId/onBrandChange are still accepted so
// call sites don't need to change, but they're no longer used to render a
// second selector here.
export function PageHeader({ title, eyebrow, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{action}</div> : null}
    </motion.div>
  );
}
