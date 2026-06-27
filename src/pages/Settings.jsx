import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { getBrand } from "../data/brands";

export function Settings({ brandId, onBrandChange }) {
  const brand = getBrand(brandId);
  const defaults = useMemo(
    () => ({
      brandName: brand.name,
      themeColor: brand.themeColor,
      supportPhone: "+91 90000 00000",
      welcomeMessage: `Hi, welcome to ${brand.name} support. How can I help?`,
      quickActions: "Track my order, Return / Exchange, Shipping & Delivery, Talk to Support"
    }),
    [brand]
  );
  const [settings, setSettings] = useState(defaults);

  function update(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function reset() {
    setSettings(defaults);
  }

  return (
    <>
      <PageHeader
        eyebrow="Demo settings"
        title="Brand settings"
        description="Editable UI only. These settings are local to the dashboard session and are not persisted yet."
        brandId={brandId}
        onBrandChange={(nextBrandId) => {
          onBrandChange(nextBrandId);
          const nextBrand = getBrand(nextBrandId);
          setSettings({
            brandName: nextBrand.name,
            themeColor: nextBrand.themeColor,
            supportPhone: "+91 90000 00000",
            welcomeMessage: `Hi, welcome to ${nextBrand.name} support. How can I help?`,
            quickActions: "Track my order, Return / Exchange, Shipping & Delivery, Talk to Support"
          });
        }}
      />

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Brand name</span>
              <input
                value={settings.brandName}
                onChange={(event) => update("brandName", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
              />
            </label>

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

            <label className="block">
              <span className="text-sm font-semibold text-ink">Support phone</span>
              <input
                value={settings.supportPhone}
                onChange={(event) => update("supportPhone", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Welcome message</span>
              <textarea
                value={settings.welcomeMessage}
                onChange={(event) => update("welcomeMessage", event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Quick actions</span>
              <input
                value={settings.quickActions}
                onChange={(event) => update("quickActions", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70"
              />
            </label>
          </div>

          <Button variant="secondary" className="mt-5" onClick={reset}>
            Reset demo values
          </Button>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-ink">Widget preview card</p>
          <div className="mt-5 overflow-hidden rounded-[28px] border border-line bg-white shadow-card">
            <div className="p-5 text-white" style={{ background: settings.themeColor }}>
              <p className="text-sm font-semibold">{settings.brandName}</p>
              <p className="mt-1 text-xs opacity-80">Online support</p>
            </div>
            <div className="p-5">
              <p className="rounded-3xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
                {settings.welcomeMessage}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {settings.quickActions.split(",").map((action) => (
                  <span key={action.trim()} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {action.trim()}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-xs text-muted">Support phone: {settings.supportPhone}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
