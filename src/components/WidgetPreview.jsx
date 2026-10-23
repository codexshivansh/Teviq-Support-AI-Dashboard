import { useMemo } from "react";
import { WIDGET_URL } from "../data/widget";

export function WidgetPreview({ settings }) {
  const appearance = settings.appearance || {};
  const width = Math.min(600, Math.max(320, Number(appearance.width) || 420));
  const height = Math.min(850, Math.max(420, Number(appearance.height) || 660));
  // Match the website widget dimensions without an extra preview card or canvas.
  const scale = 1;
  const viewportWidth = Math.max(650, width + 24);
  const config = useMemo(() => JSON.stringify({
    brandName: settings.brandName,
    themeColor: settings.themeColor,
    welcomeTitle: settings.welcomeTitle,
    welcomeBody: settings.welcomeMessage,
    quickReplies: settings.quickActions,
    appearance,
    inputPlaceholder: settings.inputPlaceholder
  }).replace(/</g, "\\u003c"), [settings, appearance]);
  const srcDoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;width:${viewportWidth}px;height:${height}px;overflow:hidden;background:transparent}body{position:relative}</style></head><body><script>window.fetch=async()=>({ok:true,json:async()=>(${config})});</script><script src="${WIDGET_URL}" data-brand-id="appearance-preview" data-api-url="https://preview.invalid"></script><script>document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{const button=document.querySelector(".teviq-chat-button");const panel=document.querySelector(".teviq-chat-window");if(button&&panel){button.click();const fit=document.createElement("style");fit.textContent='.teviq-chat-button{display:none!important}.teviq-chat-window{position:absolute!important;inset:0 auto auto 0!important;width:${width}px!important;height:${height}px!important;max-width:none!important;max-height:none!important;opacity:1!important;pointer-events:auto!important;transform:none!important;filter:none!important}';document.head.appendChild(fit)}},0),{once:true});</script></body></html>`;

  return <div className="w-fit max-w-full overflow-hidden" style={{ width: width * scale, height: height * scale }}>
    <iframe
      title="Widget appearance preview"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      style={{
        display: "block",
        border: 0,
        width: viewportWidth,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "top left"
      }}
    />
  </div>;
}
