import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Instagram, Loader2, Palette, Phone, Store, Unplug } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { LoadingState, ErrorState } from "../components/States";
import { getBrand } from "../data/brands";
import { useBrands } from "../hooks/useBrands";
import { api } from "../services/api";
import { useTeviqAuth } from "../auth/AuthContext";
import { DEFAULT_WELCOME_MESSAGE, DEFAULT_QUICK_ACTIONS } from "../data/widget";
import { BrainCircuit, ChevronRight, Send, X } from "lucide-react";

const ESCALATION_RULES = ["Fraud/legal/police keywords", "Abusive language", "Medical allergy or safety complaint"];

function toSettingsState(brand, saved) {
  return {
    brandName: brand.name,
    industry: brand.industry,
    themeColor: saved.themeColor || brand.themeColor || "#0f172a",
    supportPhone: saved.supportPhone || "",
    supportEmail: saved.supportEmail || "",
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
  const [instagramStatus, setInstagramStatus] = useState(null);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramBusy, setInstagramBusy] = useState(false);
  const [instagramError, setInstagramError] = useState("");
  const [instagramNotice, setInstagramNotice] = useState(null);

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
        welcomeMessage: settings.welcomeMessage,
        quickActions: settings.quickActions,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        businessHours: settings.businessHours,
        themeColor: settings.themeColor
      });
      const brand = getBrand(brandId, brands);
      setSettings(toSettingsState(brand, result?.settings || {}));
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
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
              <span className="text-sm font-semibold text-ink">Theme color</span>
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
              {saved ? <span className="text-sm font-semibold text-emerald-600">Saved. Refresh your website to load the settings. Site-level overrides take priority.</span> : null}
              {saveError ? <span className="text-sm font-semibold text-rose-600">{saveError}</span> : null}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <p className="text-sm font-semibold text-ink">Widget v1.2.0 preview</p>
            <p className="mt-2 text-xs text-muted">Desktop visitors can resize the widget by dragging its edges. Their chosen size is saved in their browser.</p>
            <div className="mt-5 overflow-hidden rounded-[26px] border border-[#eeece8] bg-[#fffefa] text-[#211f1c] shadow-card">
              <div className="flex items-center gap-3 border-b border-[#eeece8] p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#191816] text-white"><BrainCircuit className="h-6 w-6" /></span>
                <div className="flex-1">
                  <p className="font-serif text-lg font-semibold">Teviq AI Assistant</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-[#77736d]"><span className="h-2 w-2 rounded-full bg-emerald-600" />Available now</p>
                </div>
                <X className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-3xl">Welcome!</h3>
                <p className="mt-2 font-serif text-xl leading-relaxed text-[#77736d]">
                  {settings.welcomeMessage}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {settings.quickActions.map((action, index) => (
                    <span key={index} className="flex min-h-16 items-center justify-between gap-2 rounded-2xl border border-[#e8e5df] p-3 text-sm">
                      {action}<ChevronRight className="h-4 w-4 shrink-0 text-[#77736d]" />
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#eeece8] p-4">
                <div className="flex items-center justify-between rounded-full border border-[#e8e5df] px-4 py-3 text-sm text-[#77736d]">Type your question<Send className="h-4 w-4" style={{ color: settings.themeColor }} /></div>
                <p className="mt-3 text-center text-xs text-[#77736d]">Powered by Teviq</p>
              </div>
            </div>
          </Card>

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
    </>
  );
}
