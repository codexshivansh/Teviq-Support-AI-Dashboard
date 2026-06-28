import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Code2, Copy } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

const WIDGET_URL = "https://teviq-support-ai-widget.vercel.app/widget.js";
const API_URL = "https://teviq-support-ai-backend.onrender.com";

function StepList({ title, steps }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-3 rounded-2xl border border-line bg-white/65 p-3">
            <span className="grid h-7 w-7 flex-none place-items-center rounded-xl bg-slate-950 text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-slate-600">{step}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WidgetInstall({ brandId, onBrandChange }) {
  const [copied, setCopied] = useState(false);
  const embedScript = useMemo(
    () => `<script
  src="${WIDGET_URL}"
  data-brand-id="${brandId}"
  data-api-url="${API_URL}">
</script>`,
    [brandId]
  );

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(embedScript);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = embedScript;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {
        // The install script is still visible on the page if browser clipboard access is blocked.
      }
      textArea.remove();
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  function handleCopyPointerDown(event) {
    if (event.button === 0) {
      copyScript();
    }
  }

  function handleCopyClick(event) {
    if (event.detail === 0) {
      copyScript();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Widget deployment"
        title="Widget Install"
        description="Give this snippet to the brand owner or developer to install Teviq Support AI on their storefront."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Production embed script</p>
              <p className="mt-1 text-sm text-muted">Selected brand ID: <span className="font-semibold text-ink">{brandId}</span></p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Widget status: Ready
            </span>
          </div>

          <pre className="mt-5 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 p-5 text-sm leading-6 text-slate-100 teviq-scrollbar">
            <code>{embedScript}</code>
          </pre>

          <Button
            className="mt-5"
            onClick={handleCopyClick}
            onPointerDown={handleCopyPointerDown}
            type="button"
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy script"}
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Install summary</p>
              <p className="text-xs text-muted">One script. Brand-scoped responses.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              ["Widget CDN", WIDGET_URL],
              ["Backend API", API_URL],
              ["Brand ID", brandId]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-line bg-white/70 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
                <p className="mt-1 break-all text-sm font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <StepList
          title="Shopify installation"
          steps={[
            "Open Shopify Admin and go to Online Store > Themes.",
            "Click Customize or edit the theme code for the active theme.",
            "Paste the Teviq script before the closing body tag in theme.liquid.",
            "Save the theme and open the storefront in an incognito window.",
            "Confirm the chat launcher appears and sends a test message."
          ]}
        />
        <StepList
          title="Custom website installation"
          steps={[
            "Open the website template or global layout file.",
            "Paste the Teviq script before the closing body tag.",
            "Deploy the website changes.",
            "Open the production site and confirm the widget appears.",
            "Ask a test question for orders, returns, shipping or products."
          ]}
        />
      </div>

      <Card className="mt-5">
        <p className="text-sm font-semibold text-ink">Verification checklist</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            "Widget launcher appears on desktop and mobile.",
            "Brand name and theme load correctly.",
            "A message reaches the live backend.",
            "Order tracking asks for or accepts an order ID.",
            "Human support flow asks for contact details.",
            "No console errors from blocked scripts."
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-line bg-white/65 p-3">
              <Clipboard className="h-4 w-4 text-slate-500" />
              <p className="text-sm text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
