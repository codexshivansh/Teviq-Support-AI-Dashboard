import { useMemo } from "react";
import widgetScript from "../../public/widget-preview-v1.3.0.js?raw";

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
  const srcDoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;width:${viewportWidth}px;height:${height}px;overflow:hidden;background:transparent}body{position:relative}</style></head><body><script>window.fetch=async()=>({ok:true,json:async()=>(${config})});const nativeFocus=HTMLInputElement.prototype.focus;HTMLInputElement.prototype.focus=function(){if(this.classList.contains("teviq-chat-input"))return;return nativeFocus.apply(this,arguments)};</script><script data-brand-id="appearance-preview" data-api-url="https://preview.invalid">${widgetScript}</script><script>function showPreview(){const button=document.querySelector('.teviq-chat-button');const panel=document.querySelector('.teviq-chat-window');if(!button||!panel)return false;const fit=document.createElement('style');fit.textContent='.teviq-chat-button{display:none!important}.teviq-chat-window{position:absolute!important;inset:0 auto auto 0!important;width:${width}px!important;height:${height}px!important;max-width:none!important;max-height:none!important;opacity:1!important;pointer-events:auto!important;transform:none!important;filter:none!important}';document.head.appendChild(fit);if(!panel.classList.contains('is-open'))button.click();return true}function waitForPreview(){const deadline=Date.now()+10000;function retry(){if(showPreview()||Date.now()>deadline)return;setTimeout(retry,50)}retry()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waitForPreview,{once:true});else waitForPreview();</script></body></html>`;

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
