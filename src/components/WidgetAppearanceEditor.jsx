import { DEFAULT_APPEARANCE } from "../data/widget";

const inputClass = "widget-customization-control mt-2 w-full min-w-0 rounded-xl px-3 py-2 text-sm text-ink";
const presets = {
  Cream: DEFAULT_APPEARANCE,
  Ocean: { backgroundColor: "#f5faff", headerColor: "#e6f2ff", textColor: "#102a43", mutedColor: "#486581", borderColor: "#bccfe0", botBubbleColor: "#e6f2ff" },
  Forest: { backgroundColor: "#f7fbf5", headerColor: "#edf5e8", textColor: "#203728", mutedColor: "#536b59", borderColor: "#cbdcc5", botBubbleColor: "#edf5e8" },
  Midnight: { backgroundColor: "#141821", headerColor: "#1c2230", textColor: "#f3f4f6", mutedColor: "#b8c2d1", borderColor: "#394455", botBubbleColor: "#252d3b" }
};

export function WidgetAppearanceEditor({ value, onChange, inputPlaceholder, onPlaceholderChange }) {
  const update = (key, item) => onChange({ ...value, [key]: item });
  return <div className="mt-6 space-y-5 border-t border-line pt-5">
    <div><h3 className="font-semibold text-ink">Make it yours</h3><p className="mt-1 text-xs text-muted">Changes apply only to this workspace after saving. New installations use the creamy default.</p></div>
    <div className="flex flex-wrap gap-3">{Object.entries(presets).map(([name, preset]) => <button key={name} type="button" className="widget-customization-preset rounded-full px-3 py-2 text-xs font-semibold text-ink" onClick={() => {
      const colors = Object.fromEntries(Object.entries(preset).filter(([key]) => key.endsWith("Color")));
      onChange({ ...value, ...colors });
    }}>{name}</button>)}</div>
    <div className="grid grid-cols-2 gap-3">{Object.entries({ backgroundColor: "Background", headerColor: "Header background", textColor: "Text", mutedColor: "Secondary text", borderColor: "Borders", botBubbleColor: "Assistant replies" }).map(([key, label]) => <div key={key} className="text-sm text-ink"><span>{label}</span><div className="mt-2 flex items-center gap-2"><input aria-label={label} type="color" value={value[key]} onChange={e => update(key, e.target.value)} className="widget-customization-color h-10 w-12 rounded-xl" /><span className="text-xs text-muted">{value[key]}</span></div></div>)}</div>
    {[["headerTitle", "Assistant name"], ["statusText", "Status text"], ["logoUrl", "Logo image URL (HTTPS)"]].map(([key, label]) => <label key={key} className="block text-sm text-ink">{label}<input className={inputClass} maxLength={key === "logoUrl" ? 2048 : 80} type={key === "logoUrl" ? "url" : "text"} value={value[key]} onChange={e => update(key, e.target.value)} /></label>)}
    <p className="text-xs text-muted">Leave the logo blank to use the brain icon. Use a public HTTPS image URL.</p>
    <label className="block text-sm text-ink">Input placeholder<input className={inputClass} maxLength={120} value={inputPlaceholder} onChange={e => onPlaceholderChange(e.target.value)} /></label>
    <div className="grid grid-cols-2 gap-3">
      <label className="text-sm text-ink">Heading font<select className={inputClass} value={value.font} onChange={e => update("font", e.target.value)}><option value="serif">Classic serif</option><option value="sans">Modern sans-serif</option></select></label>
      <label className="text-sm text-ink">Position<select className={inputClass} value={value.position} onChange={e => update("position", e.target.value)}><option value="bottom-right">Bottom right</option><option value="bottom-left">Bottom left</option></select></label>
    </div>
    {[["radius", "Corner radius", 0, 40], ["width", "Desktop width", 320, 600], ["height", "Desktop height", 420, 850]].map(([key, label, min, max]) => <label key={key} className="block text-sm text-ink">{label}: {value[key]}px<input aria-label={label} type="range" min={min} max={max} value={value[key]} onChange={e => update(key, Number(e.target.value))} className="mt-2 w-full" /></label>)}
    <p className="text-xs text-muted">On mobile the panel fills the screen. Visitors’ saved sizes take priority until the default size or position changes.</p>
    {[["allowResize", "Allow visitors to resize"], ["showBranding", "Show Powered by Teviq"]].map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={value[key]} onChange={e => update(key, e.target.checked)} />{label}</label>)}
    <button type="button" className="text-sm font-semibold text-ink underline" onClick={() => onChange({ ...DEFAULT_APPEARANCE })}>Reset appearance to creamy defaults</button>
  </div>;
}
