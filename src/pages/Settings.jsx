import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Instagram, Loader2, Palette, Phone, Store, Unplug, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { LoadingState, ErrorState } from "../components/States";
import { getBrand } from "../data/brands";
import { useBrands } from "../hooks/useBrands";
import { api } from "../services/api";
import { useTeviqAuth } from "../auth/AuthContext";
import { DEFAULT_WELCOME_MESSAGE, DEFAULT_QUICK_ACTIONS, DEFAULT_APPEARANCE } from "../data/widget";
import { WidgetAppearanceEditor } from "../components/WidgetAppearanceEditor";
import { WidgetPreview } from "../components/WidgetPreview";

const ESCALATION_RULES = ["Fraud/legal/police keywords", "Abusive language", "Medical allergy or safety complaint"];

function toSettingsState(brand, saved) {
  return {
    brandName: brand.name,
    industry: brand.industry,
    themeColor: saved.themeColor || brand.themeColor || "#0f172a",
    appearance: { ...DEFAULT_APPEARANCE, ...(saved.appearance || {}), showBranding: true },
    inputPlaceholder: saved.inputPlaceholder || "Type your question",
    supportPhone: saved.supportPhone || "",
    supportEmail: saved.supportEmail || "",
    welcomeTitle: saved.welcomeTitle || "Welcome!",
    welcomeMessage: saved.welcomeMessage || DEFAULT_WELCOME_MESSAGE,
    quickActions: saved.quickActions?.length
      ? saved.quickActions
      : [...DEFAULT_QUICK_ACTIONS],
    businessHours: saved.businessHours || ""
  };
}

export function Settings({ brandId, onBrandChange }) {
  const { isDemoSession } = useTeviqAuth();
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [instagramStatus, setInstagramStatus] = useState(null);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramBusy, setInstagramBusy] = useState(false);
  const [instagramError, setInstagramError] = useState("");
  const [instagramNotice, setInstagramNotice] = useState(null);

  useEffect(() => {
    if (!customizationOpen) return undefined;
    const closeOnEscape = event => { if (event.key === "Escape") setCustomizationOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [customizationOpen]);

  const loadInstagramStatus = useCallback(async () => {
    if (!brandId) return;
    setInstagramLoading(true);
    setInstagramError("");
    try {
      setInstagramStatus(await api.getInstagramStatus(brandId));
    } catch (err) {
      setInstagramError(err.message);
    } finally {
      setInstagramLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    loadInstagramStatus();
  }, [loadInstagramStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("instagram");
    if (!result) return;
    setInstagramNotice(result === "connected"
      ? { type: "success", message: "Instagram account connected. Webhook setup and a live message test are still required." }
      : { type: "error", message: "Instagram could not be connected. Please retry or check the server configuration." });
    params.delete("instagram");
    params.delete("code");
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  async function connectInstagram() {
    setInstagramBusy(true);
    setInstagramError("");
    try {
      const result = await api.startInstagramConnection(brandId);
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      setInstagramError(err.message);
      setInstagramBusy(false);
    }
  }

  async function disconnectInstagram() {
    setInstagramBusy(true);
    setInstagramError("");
    try {
      await api.disconnectInstagram(brandId);
      setInstagramNotice({ type: "success", message: "Instagram was disconnected from this workspace." });
      await loadInstagramStatus();
    } catch (err) {
      setInstagramError(err.message);
    } finally {
      setInstagramBusy(false);
    }
  }

  const loadSettings = useCallback(() => {
    if (!brandId) return;
    let active = true;
    setLoading(true);
    setError("");
    setSaveError("");
    setSaved(false);

    api
      .getBrandSettings(brandId)
      .then((result) => {
        if (!active) return;
        const brand = getBrand(brandId, brands);
        setSettings(toSettingsState(brand, result?.settings || {}));
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
  }, [brandId, brands]);

  useEffect(() => {
    const cleanup = loadSettings();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, brands]);

  function update(field, value) {
    setSaved(false);
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function updateQuickAction(index, value) {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      quickActions: current.quickActions.map((action, actionIndex) => (actionIndex === index ? value : action))
    }));
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    setSaveError("");
    setSaved(false);

    try {
      const result = await api.updateBrandSettings(brandId, {
        welcomeTitle: settings.welcomeTitle,
        welcomeMessage: settings.welcomeMessage,
        quickActions: settings.quickActions,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        businessHours: settings.businessHours,
        themeColor: settings.themeColor,
        appearance: { ...settings.appearance, showBranding: true },
        inputPlaceholder: settings.inputPlaceholder
      });
      const brand = getBrand(brandId, brands);
      setSettings(toSettingsState(brand, result?.settings || {}));
      setSaved(true);
      return true;
    } catch (err) {
      setSaveError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  const busy = brandsLoading || loading;

  return (
    <>
      <PageHeader
        eyebrow="Brand settings"
        title="Brand settings"
        description="Configure the widget greeting, quick actions and support contact details this brand's AI assistant uses live."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      {busy ? <LoadingState label="Loading brand settings" /> : null}
      {(brandsError || error) && !busy ? <ErrorState message={brandsError || error} /> : null}

      {!busy && !brandsError && !error && settings ? (
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-fuchsia-600 text-white">
                  <Instagram className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Instagram messaging</p>
                  <p className="mt-1 text-xs leading-5 text-muted">Connect a professional account to route DMs through Teviq Brain.</p>
                </div>
              </div>
              {instagramStatus?.connected ? (
                <Button variant="secondary" onClick={disconnectInstagram} disabled={instagramBusy || isDemoSession}>
                  {instagramBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                  Disconnect
                </Button>
              ) : (
                <Button onClick={connectInstagram} disabled={instagramBusy || instagramLoading || !instagramStatus?.oauthConfigured || isDemoSession}>
                  {instagramBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
                  {instagramBusy ? "Connecting..." : "Connect Instagram"}
                </Button>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-slate-50/70 p-4 dark:bg-white/[0.03]">
              {instagramLoading ? (
                <p className="text-sm text-muted">Checking connection…</p>
              ) : instagramStatus?.connected ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Connected{instagramStatus.connection?.username ? ` as @${instagramStatus.connection.username}` : ""}
                </div>
              ) : (
                <p className="text-sm text-muted">No Instagram account is connected to this workspace.</p>
              )}
              {isDemoSession ? <p className="mt-2 text-xs text-muted">Switch to your secure workspace to connect a real account.</p> : null}
              {instagramStatus && !instagramStatus.oauthConfigured ? <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">Instagram Login is not configured on the backend yet.</p> : null}
            </div>

            {instagramNotice ? (
              <p className={`mt-3 text-sm font-medium ${instagramNotice.type === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                {instagramNotice.message}
              </p>
            ) : null}
            {instagramError ? <p className="mt-3 text-sm font-medium text-rose-600">{instagramError}</p> : null}
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Brand profile</p>
                <p className="text-xs text-muted">Set during onboarding</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Brand name</span>
                <input
                  value={settings.brandName}
                  disabled
                  title="Brand name is set during onboarding and can't be changed here."
                  className="mt-2 w-full cursor-not-allowed rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-muted outline-none dark:bg-white/5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Industry</span>
                <input
                  value={settings.industry}
                  disabled
                  title="Industry is set during onboarding and can't be changed here."
                  className="mt-2 w-full cursor-not-allowed rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm text-muted outline-none dark:bg-white/5"
                />
              </label>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Widget theme</p>
                <p className="text-xs text-muted">Colors and greeting</p>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Accent colour (launcher, send button and your messages)</span>
              <div className="mt-2 flex gap-3">
                <input
                  type="color"
                  value={settings.themeColor}
                  onChange={(event) => update("themeColor", event.target.value)}
                  className="h-12 w-16 rounded-2xl border border-line bg-white p-1 dark:bg-white/10"
                />
                <input
                  value={settings.themeColor}
                  onChange={(event) => update("themeColor", event.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 dark:bg-white/5"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">Welcome heading</span>
              <input
                value={settings.welcomeTitle}
                onChange={(event) => update("welcomeTitle", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink dark:bg-white/5"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">Welcome message</span>
              <textarea
                value={settings.welcomeMessage}
                onChange={(event) => update("welcomeMessage", event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 dark:bg-white/5"
              />
            </label>

            <div className="mt-4">
              <p className="text-sm font-semibold text-ink">Quick actions</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {settings.quickActions.map((action, index) => (
                  <input
                    key={index}
                    value={action}
                    onChange={(event) => updateQuickAction(index, event.target.value)}
                    className="rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 dark:bg-white/5"
                  />
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div><p className="text-sm font-semibold text-ink">Detailed widget customization</p><p className="mt-1 text-sm text-muted">Personalize colours, logo, layout and more for this workspace.</p></div>
              <Button variant="secondary" onClick={() => setCustomizationOpen(true)}><Palette className="h-4 w-4" />Customize widget</Button>
            </div>
          </Card>

          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Phone className="h-4 w-4" />
                  Support phone
                </span>
                <input
                  value={settings.supportPhone}
                  onChange={(event) => update("supportPhone", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 dark:bg-white/5"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Support email</span>
                <input
                  value={settings.supportEmail}
                  onChange={(event) => update("supportEmail", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 dark:bg-white/5"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Clock3 className="h-4 w-4" />
                  Business hours
                </span>
                <input
                  value={settings.businessHours}
                  onChange={(event) => update("businessHours", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 dark:bg-white/5"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button variant="secondary" onClick={loadSettings} disabled={saving}>
                Discard changes
              </Button>
              {saved ? <span className="text-sm font-semibold text-emerald-600">Saved. Your website widget uses these settings automatically.</span> : null}
              {saveError ? <span className="text-sm font-semibold text-rose-600">{saveError}</span> : null}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="mx-auto w-fit max-w-full">
            <WidgetPreview settings={settings} />
          </div>

          <Card>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Escalation rules preview</p>
                <p className="text-xs text-muted">Hard handoff triggers</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {ESCALATION_RULES.map((rule) => (
                <div key={rule} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-sm font-medium text-amber-800">
                  {rule}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-ink">Support contact preview</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-line bg-white/70 p-3 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Phone</p>
                <p className="mt-1 text-sm font-semibold text-ink">{settings.supportPhone}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white/70 p-3 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Email</p>
                <p className="mt-1 text-sm font-semibold text-ink">{settings.supportEmail}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white/70 p-3 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Hours</p>
                <p className="mt-1 text-sm font-semibold text-ink">{settings.businessHours}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      ) : null}
      {customizationOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" onMouseDown={event => { if (event.target === event.currentTarget) setCustomizationOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="widget-customization-title" className="widget-customization-dialog flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl">
            <header className="flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-7">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{settings.brandName}</p><h2 id="widget-customization-title" className="mt-1 text-xl font-bold text-ink">Customize your widget</h2></div>
              <button type="button" aria-label="Close customization" onClick={() => setCustomizationOpen(false)} className="rounded-xl p-2 text-muted hover:bg-white/70"><X className="h-5 w-5" /></button>
            </header>
            <div className="widget-customization-content grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 sm:p-7 xl:grid-cols-[0.9fr_1.1fr]">
              <WidgetAppearanceEditor value={settings.appearance} onChange={value => update("appearance", value)} inputPlaceholder={settings.inputPlaceholder} onPlaceholderChange={value => update("inputPlaceholder", value)} />
              <div className="mx-auto w-fit max-w-full xl:sticky xl:top-0 xl:self-start"><WidgetPreview settings={settings} /></div>
            </div>
            <footer className="widget-customization-footer flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 sm:px-7">
              <span className="text-xs text-muted">Edits stay as a draft until you save.</span>
              <div className="flex gap-2"><Button variant="secondary" onClick={() => setCustomizationOpen(false)}>Close</Button><Button onClick={async () => { if (await save()) setCustomizationOpen(false); }} disabled={saving}>{saving ? "Saving..." : "Save customization"}</Button></div>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
