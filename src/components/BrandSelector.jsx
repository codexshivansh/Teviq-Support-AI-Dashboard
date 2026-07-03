import { BRANDS } from "../data/brands";

export function BrandSelector({ brandId, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-line/80 bg-white/80 px-3 py-2 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Brand</span>
      <select
        value={brandId}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Select workspace brand"
        className="min-w-0 rounded-xl bg-transparent text-sm font-semibold text-ink outline-none focus:ring-4 focus:ring-slate-950/10"
      >
        {BRANDS.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </label>
  );
}
