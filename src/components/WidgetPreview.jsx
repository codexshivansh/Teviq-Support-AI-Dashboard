import { Bot, ChevronRight, Plus, Send, X } from "lucide-react";

export function WidgetPreview({ settings }) {
  const appearance = settings.appearance || {};
  const actions = (settings.quickActions || []).filter(Boolean).slice(0, 4);
  const panelWidth = Math.min(320, Math.max(260, Number(appearance.width) * 0.72 || 302));
  const radius = Math.min(24, Math.max(12, Number(appearance.radius ?? 26) * 0.72));
  const style = {
    "--preview-surface": appearance.backgroundColor || "#fffefa",
    "--preview-header": appearance.headerColor || "#fffefa",
    "--preview-ink": appearance.textColor || "#211f1c",
    "--preview-muted": appearance.mutedColor || "#77736d",
    "--preview-line": appearance.borderColor || "#e8e5df",
    "--preview-bubble": appearance.botBubbleColor || "#f5f3ef",
    "--preview-accent": settings.themeColor || "#101828",
    "--preview-radius": `${radius}px`,
    width: `min(${panelWidth}px, 100%)`,
    fontFamily: appearance.font === "sans" ? "Inter, ui-sans-serif, system-ui, sans-serif" : 'Georgia, "Times New Roman", serif'
  };

  return <div>
    <p className="font-semibold text-ink">Widget preview</p>
    <div className="mt-3 flex justify-center">
      <section aria-label="Widget preview" className="flex h-[360px] max-h-full min-h-0 flex-col overflow-hidden border shadow-[0_12px_32px_rgba(15,23,42,0.18)]" style={{ ...style, borderRadius: `var(--preview-radius)`, borderColor: "var(--preview-line)", background: "var(--preview-surface)" }}>
        <header className="flex h-[56px] shrink-0 items-center gap-2.5 border-b px-3" style={{ background: "var(--preview-header)", borderColor: "var(--preview-line)" }}>
          <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-xl" style={{ color: "var(--preview-accent)", background: "color-mix(in srgb, var(--preview-accent) 10%, white)" }}>
            {appearance.logoUrl ? <img src={appearance.logoUrl} alt="" className="h-full w-full object-contain" onError={event => { event.currentTarget.style.display = "none"; }} /> : <Bot className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1 font-sans">
            <p className="truncate text-xs font-semibold" style={{ color: "var(--preview-ink)" }}>{appearance.headerTitle || "Teviq AI Assistant"}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px]" style={{ color: "var(--preview-muted)" }}><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{appearance.statusText || "Available now"}</p>
          </div>
          <button type="button" aria-label="Close preview" className="grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ background: "var(--preview-bubble)", color: "var(--preview-ink)" }}><X className="h-3.5 w-3.5" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden px-3.5 py-3">
          <h3 className="text-[25px] font-medium leading-[1.05] tracking-tight" style={{ color: "var(--preview-ink)" }}>{settings.welcomeTitle || "Welcome!"}</h3>
          <p className="mt-1.5 text-[13px] leading-[1.4]" style={{ color: "var(--preview-muted)" }}>{settings.welcomeMessage || "Ask me about our products, services, pricing, or anything else you’re curious about."}</p>
          <div className="mt-3 grid grid-cols-2 gap-1.5 font-sans">
            {actions.map((action, index) => <div key={`${action}-${index}`} className="flex min-h-[43px] items-center justify-between gap-1 rounded-xl border px-2 py-1.5 text-[10px] font-medium leading-tight" style={{ color: "var(--preview-ink)", borderColor: "var(--preview-line)", background: "var(--preview-surface)" }}>
              <span>{action}</span><ChevronRight className="h-3 w-3 shrink-0" style={{ color: "var(--preview-muted)" }} />
            </div>)}
          </div>
        </div>

        <footer className="shrink-0 border-t px-2.5 pb-1.5 pt-2 font-sans" style={{ borderColor: "var(--preview-line)", background: "var(--preview-surface)" }}>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ color: "var(--preview-ink)", background: "var(--preview-bubble)" }}><Plus className="h-4 w-4" /></span>
            <div className="flex h-8 min-w-0 flex-1 items-center rounded-full border px-3 text-[10px]" style={{ color: "var(--preview-muted)", borderColor: "var(--preview-line)" }}>{settings.inputPlaceholder || "Type your question"}</div>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white" style={{ background: "var(--preview-accent)" }}><Send className="h-3.5 w-3.5" /></span>
          </div>
          {appearance.showBranding !== false ? <p className="mt-1 text-center text-[9px] text-muted">Powered by <strong>Teviq</strong></p> : null}
        </footer>
      </section>
    </div>
  </div>;
}
