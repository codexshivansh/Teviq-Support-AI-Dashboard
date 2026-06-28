import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, Palette, Phone, Store } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { getBrand } from "../data/brands";

function buildDefaults(brandId) {
  const brand = getBrand(brandId);
  return {
    brandName: brand.name,
    industry: brand.industry,
    themeColor: brand.themeColor,
    supportPhone: "+91 90000 00000",
    supportEmail: "support@example.com",
    welcomeMessage: `Hi, welcome to ${brand.name} support. How can I help?`,
    quickActions: ["Track my order", "Return / Exchange", "Shipping & Delivery", "Talk to Support"],
    businessHours: "Mon-Sat, 10:00 AM - 7:00 PM IST",
    escalationRules: ["Fraud/legal/police keywords", "Abusive language", "Medical allergy or safety complaint"]
  };
}

export function Settings({ brandId, onBrandChange }) {
  const defaults = useMemo(() => buildDefaults(brandId), [brandId]);
  const [settings, setSettings] = useState(defaults);

  useEffect(() => {
    setSettings(buildDefaults(brandId));
  }, [brandId]);

  function update(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function updateQuickAction(index, value) {
    setSettings((current) => ({
      ...current,
      quickActions: current.quickActions.map((action, actionIndex) => (actionIndex === index ? value : action))
    }));
  }

  function reset() {
    setSettings(defaults);
  }

  return (
    <>
      <PageHeader
        eyebrow="Demo settings"
        title="Brand settings"
        description="Configure the brand profile, widget tone and escalation rules for the demo workspace. Changes are local-only."
        brandId={brandId}
        onBrandChange={onBrandChange}
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Brand profile</p>
                <p className="text-xs text-muted">Demo workspace identity</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Brand name</span>
                <input
                  value={settings.brandName}
                  onChange={(event) => update("brandName", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Industry</span>
                <input
                  value={settings.industry}
                  onChange={(event) => update("industry", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
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
                  className="h-12 w-16 rounded-2xl border border-line bg-white p-1"
                />
                <input
                  value={settings.themeColor}
                  onChange={(event) => update("themeColor", event.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink">Welcome message</span>
              <textarea
                value={settings.welcomeMessage}
                onChange={(event) => update("welcomeMessage", event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
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
                    className="rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
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
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink">Support email</span>
                <input
                  value={settings.supportEmail}
                  onChange={(event) => update("supportEmail", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
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
                  className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
                />
              </label>
            </div>

            <Button variant="secondary" className="mt-5" onClick={reset}>
              Reset demo values
            </Button>
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
              {settings.escalationRules.map((rule) => (
                <div key={rule} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3 text-sm font-medium text-amber-800">
                  {rule}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-ink">Support contact preview</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-line bg-white/70 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Phone</p>
                <p className="mt-1 text-sm font-semibold text-ink">{settings.supportPhone}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white/70 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Email</p>
                <p className="mt-1 text-sm font-semibold text-ink">{settings.supportEmail}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white/70 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Hours</p>
                <p className="mt-1 text-sm font-semibold text-ink">{settings.businessHours}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
