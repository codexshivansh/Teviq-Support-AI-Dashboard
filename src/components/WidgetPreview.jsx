import { useEffect, useRef, useState } from "react";
import { WIDGET_URL } from "../data/widget";

export function WidgetPreview({ settings }) {
  const host = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(360);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width));
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  // A single compact preview keeps the customization dialog focused on the
  // widget itself instead of switching between separate device mockups.
  const width = 420;
  const height = 520;
  const scale = Math.min(1, availableWidth / width, 360 / height);
  const config = JSON.stringify({
    brandName: settings.brandName, themeColor: settings.themeColor,
    welcomeTitle: settings.welcomeTitle, welcomeBody: settings.welcomeMessage,
    quickReplies: settings.quickActions, appearance: settings.appearance,
    inputPlaceholder: settings.inputPlaceholder
  }).replace(/</g, "\\u003c");
  const srcDoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#e9e8e4}.teviq-chat-form input,.teviq-chat-form button,.teviq-quick-reply{pointer-events:none}</style></head><body><script>window.fetch=async()=>({ok:true,json:async()=>(${config})});</script><script src="${WIDGET_URL}" data-brand-id="appearance-preview" data-api-url="https://preview.invalid" onload="document.querySelector('.teviq-chat-button')?.click()"></script></body></html>`;
  return <div ref={host}>
    <p className="font-semibold text-ink">Widget preview</p>
    <p className="mt-2 text-xs text-muted">Compact live rendering. Chat is disabled here; use AI Playground to test answers.</p>
    <div className="mt-4 overflow-hidden rounded-2xl border border-line" style={{ height: height * scale }}>
      <iframe title="Widget appearance preview" sandbox="allow-scripts" srcDoc={srcDoc} style={{ border: 0, width, height, transform: `scale(${scale})`, transformOrigin: "top left" }} />
    </div>
  </div>;
}
