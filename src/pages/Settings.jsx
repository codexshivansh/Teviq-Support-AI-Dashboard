import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Clock3, Palette, Phone, Store } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { LoadingState, ErrorState } from "../components/States";
import { getBrand } from "../data/brands";
import { useBrands } from "../hooks/useBrands";
import { api } from "../services/api";

const ESCALATION_RULES = ["Fraud/legal/police keywords", "Abusive language", "Medical allergy or safety complaint"];

function toSettingsState(brand, saved) {
  return {
    brandName: brand.name,
    industry: brand.industry,
    themeColor: saved.themeColor || brand.themeColor || "#0f172a",
    supportPhone: saved.supportPhone || "",
    supportEmail: saved.supportEmail || "",
    welcomeMessage: saved.welcomeMessage || `Hi, welcome to ${brand.name} support. How can I help?`,
    quickActions: saved.quickActions?.length
      ? saved.quickActions
      : ["Track my order", "Return / Exchange", "Shipping & Delivery", "Talk to Support"],
    businessHours: saved.businessHours || ""
  };
}

export function Settings({ brandId, onBrandChange }) {
  const { brands, loading: brandsLoading, error: brandsError } = useBrands();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

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
              {saved ? <span className="text-sm font-semibold text-emerald-600">Saved. The live widget now uses these values.</span> : null}
              {saveError ? <span className="text-sm font-semibold text-rose-600">{saveError}</span> : null}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <p className="text-sm font-semibold text-ink">Widget theme preview</p>
            <div className="mt-5 overflow-hidden rounded-[28px] border border-line bg-white shadow-card">
              <div className="p-5 text-white" style={{ background: settings.themeColor }}>
                <p className="text-sm font-semibold">{settings.brandName}</p>
                <p className="mt-1 text-xs opacity-80">Online support · {settings.industry}</p>
              </div>
              <div className="p-5">
                <p className="rounded-3xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
                  {settings.welcomeMessage}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {settings.quickActions.map((action) => (
                    <span key={action} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {action}
                    </span>
                  ))}
                </div>
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
