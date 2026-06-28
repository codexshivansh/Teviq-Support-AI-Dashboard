import {
  BarChart3,
  Bot,
  Code2,
  Database,
  Home,
  Menu,
  MessagesSquare,
  Settings,
  ShoppingBag,
  Sparkles,
  X
} from "lucide-react";
import { useState } from "react";
import { BRANDS, getBrand } from "../data/brands";

const navItems = [
  { id: "home", label: "Overview", icon: Home },
  { id: "conversations", label: "Conversations", icon: MessagesSquare },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "playground", label: "AI Playground", icon: Bot },
  { id: "shopify", label: "Shopify", icon: ShoppingBag },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "widget-install", label: "Widget Install", icon: Code2 },
  { id: "settings", label: "Settings", icon: Settings }
];

function WorkspaceSelector({ brandId, onBrandChange, compact = false }) {
  const brand = getBrand(brandId);

  return (
    <label className={`block rounded-3xl border border-line/80 bg-white/78 shadow-sm ${compact ? "px-3 py-2" : "p-3"}`}>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Workspace</span>
      <div className="mt-2 flex items-center gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-2xl text-xs font-black text-white"
          style={{ background: brand.themeColor }}
        >
          {brand.name.slice(0, 2).toUpperCase()}
        </span>
        <select
          value={brandId}
          onChange={(event) => onBrandChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none"
        >
          {BRANDS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function Sidebar({ activePage, onNavigate, onClose, brandId, onBrandChange }) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-white/70 bg-white/72 px-4 py-5 shadow-soft backdrop-blur-2xl lg:w-76">
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-card">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Teviq Support AI</p>
            <p className="text-xs font-medium text-muted">SaaS Admin v1</p>
          </div>
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6">
        <WorkspaceSelector brandId={brandId} onBrandChange={onBrandChange} />
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-line/80 bg-white/75 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Demo mode</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          No auth, billing or real Shopify OAuth. Built for client walkthroughs.
        </p>
      </div>
    </aside>
  );
}

export function Layout({ activePage, onNavigate, brandId, onBrandChange, children }) {
  const [open, setOpen] = useState(false);
  const brand = getBrand(brandId);

  return (
    <div className="min-h-screen text-ink">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar
          activePage={activePage}
          onNavigate={onNavigate}
          brandId={brandId}
          onBrandChange={onBrandChange}
        />
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close navigation backdrop"
          />
          <div className="relative">
            <Sidebar
              activePage={activePage}
              onNavigate={onNavigate}
              onClose={() => setOpen(false)}
              brandId={brandId}
              onBrandChange={onBrandChange}
            />
          </div>
        </div>
      ) : null}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/70 bg-white/70 px-4 backdrop-blur-2xl lg:hidden">
          <button
            className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-white"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: brand.themeColor }} />
            <p className="text-sm font-semibold">{brand.name}</p>
          </div>
          <span className="h-10 w-10" />
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 hidden items-center justify-between rounded-[28px] border border-white/70 bg-white/68 px-4 py-3 shadow-sm backdrop-blur-2xl lg:flex">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Admin portal</p>
              <p className="mt-1 text-sm font-semibold text-ink">Manage AI support for {brand.name}</p>
            </div>
            <div className="w-72">
              <WorkspaceSelector brandId={brandId} onBrandChange={onBrandChange} compact />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
