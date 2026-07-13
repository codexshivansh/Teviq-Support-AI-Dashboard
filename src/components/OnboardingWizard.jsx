import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  Database,
  Loader2,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Card } from "./Card";
import { ErrorState, LoadingState } from "./States";
import { api } from "../services/api";

const STEP_KEY = "teviq_onboarding_step";
const MINIMIZED_KEY = "teviq_onboarding_minimized";
const WIDGET_URL = "https://teviq-support-ai-widget.vercel.app/widget.js";
const API_URL = "https://teviq-support-ai-backend.onrender.com";

const brandCategories = ["Fashion", "Beauty", "Electronics", "Home & Living", "Sports", "Other"];
const supportLanguages = ["Hindi", "English", "Hinglish"];

function readStoredStep() {
  try {
    const value = Number(localStorage.getItem(STEP_KEY));
    return value >= 1 && value <= 4 ? value : 1;
  } catch {
    return 1;
  }
}

function getMetadataBrandId(metadata = {}) {
  return metadata.brandId || metadata.brand_id || metadata.workspaceBrandId || metadata.workspace_brand_id || "";
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      className="mt-2 w-full rounded-2xl border border-line bg-white/82 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-950/5"
      {...props}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      className="mt-2 w-full rounded-2xl border border-line bg-white/82 px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-950/5"
      {...props}
    />
  );
}

function ProgressHeader({ step }) {
  const progress = Math.round((step / 4) * 100);

  return (
    <div className="mx-auto mb-6 w-full max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-card">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Teviq Support AI</p>
            <p className="text-xs font-medium text-muted">First-time setup</p>
          </div>
        </div>
        <span className="rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
          Step {step}/4
        </span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/70">
        <motion.div
          className="h-full rounded-full bg-slate-950"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function StepShell({ step, title, description, children, onBack, footer }) {
  return (
    // This onboarding screen always renders on a fixed light page background,
    // so the --color-* CSS vars are pinned to their light values here
    // regardless of the dashboard's dark-mode setting on an ancestor element
    // — otherwise text-ink/text-muted would flip to near-white and become
    // invisible against this hardcoded-light background.
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.09),_transparent_34%),#f8fafc] px-4 py-6 text-ink sm:px-6 lg:px-8"
      style={{
        "--color-ink": "15 23 42",
        "--color-muted": "100 116 139",
        "--color-line": "226 232 240",
        "--color-panel": "rgba(255, 255, 255, 0.78)",
        colorScheme: "light"
      }}
    >
      <ProgressHeader step={step} />
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24 }}
        className="mx-auto w-full max-w-5xl"
      >
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Onboarding</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
            </div>
            {onBack ? (
              <Button variant="secondary" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : null}
          </div>
          <div className="mt-7">{children}</div>
          {footer ? <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div> : null}
        </Card>
      </motion.div>
    </div>
  );
}

function BrandSetupStep({ form, onChange, onSubmit, saving }) {
  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Brand name">
          <TextInput
            required
            value={form.brandName}
            onChange={(event) => onChange({ brandName: event.target.value })}
            placeholder="e.g. Urban Threads"
          />
        </Field>
        <Field label="Brand category">
          <SelectInput
            required
            value={form.brandCategory}
            onChange={(event) => onChange({ brandCategory: event.target.value })}
          >
            {brandCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Support language">
          <SelectInput
            required
            value={form.supportLanguage}
            onChange={(event) => onChange({ supportLanguage: event.target.value })}
          >
            {supportLanguages.map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Escalation WhatsApp">
          <TextInput
            value={form.escalationWhatsapp}
            onChange={(event) => onChange({ escalationWhatsapp: event.target.value })}
            placeholder="+91 98765 43210"
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {saving ? "Saving" : "Save and continue"}
        </Button>
      </div>
    </form>
  );
}

function ShopifyStep({ brandId, onNext }) {
  const [status, setStatus] = useState(null);
  const [storeUrl, setStoreUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(brandId));
  const [connecting, setConnecting] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [error, setError] = useState("");
  const connected = Boolean(status?.connected);
  const canContinue = connected || skipped;

  useEffect(() => {
    if (!brandId) return;
    let active = true;
    setLoading(true);
    setError("");
    api.getShopifyStatus(brandId)
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [brandId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get("shopify");
    if (!oauthResult) return;

    if (oauthResult === "error") {
      setError("Shopify could not be connected. Please try again or skip this step for now.");
    }

    params.delete("shopify");
    params.delete("code");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  async function connectStore(event) {
    event.preventDefault();
    if (!brandId) return;
    setConnecting(true);
    setSkipped(false);
    setError("");
    try {
      const data = await api.startShopifyConnection(brandId, {
        storeUrl,
        returnPath: "/"
      });
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-white/65">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink">Shopify connector</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Connect commerce data so Teviq can answer order, product and fulfillment questions.
        </p>
        <a
          href="https://help.shopify.com/en/manual/your-account/logging-in/shopify-admin"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-slate-900"
        >
          Where to find your store address
        </a>
      </Card>

      <Card className="bg-white/65">
        {loading ? <LoadingState label="Checking Shopify status" /> : null}
        {!loading ? (
          <>
            {connected ? (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Connected
                </p>
                <p className="mt-2 text-sm text-emerald-700">
                  {status.shopName || status.storeHost || "Your Shopify store"} is connected and ready to sync.
                </p>
              </div>
            ) : null}
            {!connected ? (
            <form className="mt-5 rounded-3xl border border-line bg-white/70 p-5" onSubmit={connectStore}>
              <p className="text-sm font-semibold text-ink">Connect your Shopify store</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Enter your <span className="font-semibold text-ink">.myshopify.com</span> address. Shopify will open its secure authorization screen next.
              </p>
              <div className="mt-4 grid gap-4">
                <Field label="Shopify store URL">
                  <TextInput
                    required={!skipped}
                    value={storeUrl}
                    onChange={(event) => {
                      setSkipped(false);
                      setStoreUrl(event.target.value);
                    }}
                    placeholder="your-store.myshopify.com"
                  />
                </Field>
              </div>
              {error ? <p className="mt-3 text-sm text-amber-700">{error}</p> : null}
              {!status?.oauthConfigured ? (
                <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                  Shopify authorization is not configured for this deployment yet. You can skip and connect it later.
                </p>
              ) : null}
              {skipped ? (
                <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                  Shopify skipped for now. You can continue setup and connect it later.
                </p>
              ) : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSkipped(true);
                    setError("");
                  }}
                  className="text-left text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-950 hover:decoration-slate-950"
                >
                  Skip for now
                </button>
                <Button type="submit" disabled={connecting || !brandId || !status?.oauthConfigured}>
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                  {connecting ? "Opening Shopify" : "Continue with Shopify"}
                </Button>
              </div>
            </form>
            ) : null}
            <div className="mt-5 flex justify-end">
              <Button onClick={onNext} disabled={!canContinue}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}

function KnowledgeStep({ onOpenKnowledge, onNext }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="bg-white/65">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
          <Database className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-ink">Add brand knowledge</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Add your first policy or FAQ so AI can answer brand-specific questions.
        </p>
      </Card>
      <Card className="bg-white/65">
        <div className="space-y-3">
          {["Return policy", "Shipping FAQ", "COD or payment rule"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white/70 p-3 text-sm font-medium text-slate-600">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onNext}>I'll do this later</Button>
          <Button variant="secondary" onClick={onNext}>Done, continue</Button>
          <Button onClick={onOpenKnowledge}>
            Go to Knowledge Base
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function WidgetStep({ brandId, onComplete, completing }) {
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
        // The snippet remains visible if clipboard access is blocked.
      }
      textArea.remove();
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="grid gap-5">
      <pre className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 p-5 text-sm leading-6 text-slate-100 teviq-scrollbar">
        <code>{embedScript}</code>
      </pre>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={copyScript}>
          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          {copied ? "Copied" : "Copy script"}
        </Button>
        <Button onClick={onComplete} disabled={completing}>
          {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {completing ? "Finishing" : "Mark as done"}
        </Button>
      </div>
    </div>
  );
}

export function OnboardingWizard({ metadata, onComplete, onNavigate, refreshUser }) {
  const [step, setStep] = useState(readStoredStep);
  const [form, setForm] = useState({
    brandName: metadata?.brand_name || "",
    brandCategory: metadata?.brand_category || "Fashion",
    supportLanguage: metadata?.support_language || "Hinglish",
    escalationWhatsapp: metadata?.escalation_whatsapp || ""
  });
  const [currentMetadata, setCurrentMetadata] = useState(metadata || {});
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const brandId = getMetadataBrandId(currentMetadata);

  useEffect(() => {
    setCurrentMetadata(metadata || {});
  }, [metadata]);

  useEffect(() => {
    try {
      localStorage.setItem(STEP_KEY, String(step));
    } catch {
      // Step persistence should not block onboarding.
    }
  }, [step]);

  function goToStep(nextStep) {
    setError("");
    setStep(Math.min(4, Math.max(1, nextStep)));
  }

  async function submitBrandSetup(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await api.saveOnboardingBrandSetup(form);
      setCurrentMetadata(data.publicMetadata || {});
      await refreshUser?.();
      goToStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openKnowledgeBase() {
    try {
      localStorage.setItem(MINIMIZED_KEY, "true");
    } catch {
      // Optional minimization state.
    }
    onNavigate?.("knowledge");
  }

  async function complete() {
    setCompleting(true);
    setError("");
    try {
      const data = await api.completeOnboarding();
      setCurrentMetadata(data.publicMetadata || {});
      await refreshUser?.();
      try {
        localStorage.removeItem(STEP_KEY);
        localStorage.removeItem(MINIMIZED_KEY);
      } catch {
        // Ignore restricted storage.
      }
      onComplete?.(data.publicMetadata || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setCompleting(false);
    }
  }

  const commonError = error ? <div className="mb-5"><ErrorState message={error} /></div> : null;

  if (step === 1) {
    return (
      <StepShell
        step={1}
        title="Set up your brand"
        description="Tell Teviq how this workspace should identify your brand and support language."
      >
        {commonError}
        <BrandSetupStep
          form={form}
          saving={saving}
          onChange={(updates) => setForm((current) => ({ ...current, ...updates }))}
          onSubmit={submitBrandSetup}
        />
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        step={2}
        title="Connect Shopify"
        description="Review or activate the Shopify-style connector for product and order support."
        onBack={() => goToStep(1)}
      >
        {commonError}
        <ShopifyStep brandId={brandId} onNext={() => goToStep(3)} />
      </StepShell>
    );
  }

  if (step === 3) {
    return (
      <StepShell
        step={3}
        title="Add your first knowledge"
        description="Policies and FAQs help Teviq answer accurately in your brand context."
        onBack={() => goToStep(2)}
      >
        {commonError}
        <KnowledgeStep onOpenKnowledge={openKnowledgeBase} onNext={() => goToStep(4)} />
      </StepShell>
    );
  }

  return (
    <StepShell
      step={4}
      title="Install the widget"
      description="Add this script to the storefront when you are ready to start receiving conversations."
      onBack={() => goToStep(3)}
    >
      {commonError}
      <WidgetStep brandId={brandId} onComplete={complete} completing={completing} />
    </StepShell>
  );
}
