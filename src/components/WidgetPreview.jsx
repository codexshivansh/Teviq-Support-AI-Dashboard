import { Bot, Send } from "lucide-react";

export function WidgetPreview({ settings }) {
  const appearance = settings.appearance || {};
  const width = Math.min(600, Math.max(320, Number(appearance.width) || 420));
  const height = Math.min(850, Math.max(420, Number(appearance.height) || 660));
  const theme = settings.themeColor || "#0f172a";
  const background = appearance.backgroundColor || "#fffefa";
  const foreground = appearance.textColor || "#211f1c";
  const muted = appearance.mutedColor || "#77736d";
  const border = appearance.borderColor || "#e8e5df";
  const headingFont = appearance.font === "sans" ? "Inter, ui-sans-serif, system-ui, sans-serif" : 'Georgia, "Times New Roman", serif';
  const quickReplies = (settings.quickActions || []).slice(0, 4);

  return (
    <div
      aria-label="Widget appearance preview"
      className="flex max-w-full flex-col overflow-hidden border shadow-2xl"
      style={{ width, height, borderColor: border, borderRadius: appearance.radius ?? 26, backgroundColor: background, color: foreground }}
    >
      <div className="flex items-center gap-3 border-b px-5 py-4" style={{ backgroundColor: appearance.headerColor || background, borderColor: border }}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white" style={{ backgroundColor: theme }}>
          {appearance.logoUrl?.startsWith("https://") ? <img src={appearance.logoUrl} alt="" className="h-full w-full object-contain" /> : <Bot size={24} />}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold" style={{ fontFamily: headingFont }}>{appearance.headerTitle || "Teviq AI Assistant"}</div>
          <div className="text-xs" style={{ color: muted }}>{appearance.statusText ?? "Available now"}</div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: muted }}>{settings.brandName}</div>
        <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: border, backgroundColor: appearance.botBubbleColor || "#f5f3ef" }}>
          <h3 className="text-xl font-semibold" style={{ fontFamily: headingFont }}>{settings.welcomeTitle || "Welcome!"}</h3>
          <p className="mt-2 text-sm leading-6" style={{ color: muted }}>{settings.welcomeMessage}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => {
            const label = typeof reply === "string" ? reply : reply.label || reply.message;
            return <span key={`${label}-${index}`} className="rounded-full border px-3 py-2 text-xs" style={{ borderColor: border }}>{label}</span>;
          })}
        </div>
      </div>
      <div className="border-t px-4 py-3" style={{ borderColor: border }}>
        <div className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm" style={{ borderColor: border, color: muted }}>
          <span className="flex-1">{settings.inputPlaceholder || "Type your question"}</span><Send size={18} style={{ color: theme }} />
        </div>
        <div className="mt-2 text-center text-[11px]" style={{ color: muted }}>Powered by Teviq</div>
      </div>
    </div>
  );
}
