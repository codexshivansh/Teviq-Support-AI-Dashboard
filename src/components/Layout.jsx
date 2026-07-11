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
import { useTeviqAuth } from "../auth/AuthContext";
import { getBrand } from "../data/brands";
import { useBrands } from "../hooks/useBrands";

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
  const { brands, loading, error } = useBrands();
  const brand = getBrand(brandId, brands);
  const canSwitchBrands = typeof onBrandChange === "function";

  return (
    <div className={`block rounded-3xl border border-line/80 bg-white/78 shadow-sm ${compact ? "px-3 py-2" : "p-3"}`}>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Workspace</span>
      <div className="mt-2 flex items-center gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-2xl text-xs font-black text-white"
          style={{ background: brand.themeColor }}
        >
          {brand.name.slice(0, 2).toUpperCase()}
        </span>
        {canSwitchBrands ? (
          loading ? (
            <span className="min-w-0 flex-1 text-sm font-medium text-muted">Loading workspaces...</span>
          ) : error ? (
            <span className="min-w-0 flex-1 text-xs font-medium text-rose-600">Could not load workspaces</span>
          ) : (
            <select
              value={brandId}
              onChange={(event) => onBrandChange(event.target.value)}
              aria-label="Select workspace brand"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none"
            >
              {brands.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )
        ) : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{brand.name}</p>
            <p className="mt-0.5 text-xs font-medium text-muted">{brand.industry}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Sidebar({ activePage, onNavigate, onClose, brandId, onBrandChange }) {
  const { isDemoSession } = useTeviqAuth();

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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
          {isDemoSession ? "Demo mode" : "Secure workspace"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isDemoSession
            ? "Instant Urban Demo access for client walkthroughs."
            : "Authenticated access for knowledge, connectors and workspace setup."}
        </p>
      </div>
    </aside>
  );
}

function UserProfileControl({ compact = false }) {
  const { isDemoSession, signOut, user } = useTeviqAuth();

  if (!isDemoSession && user) {
    const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || "Teviq user";
    const imageUrl = user.imageUrl;

    return (
      <div className={`flex items-center gap-2 rounded-3xl border border-line/80 bg-white/78 px-2 py-2 shadow-sm ${compact ? "max-w-[150px]" : "px-3"}`}>
        <div className={`${compact ? "hidden" : "hidden text-right sm:block"}`}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Signed in</p>
          <p className="max-w-36 truncate text-sm font-semibold text-ink">{displayName}</p>
        </div>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-9 w-9 rounded-2xl object-cover" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white">
            {displayName.slice(0, 2).toUpperCase()}
          </span>
        )}
        <button
          type="button"
          onClick={signOut}
          className="rounded-2xl border border-line bg-white px-2.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-3xl border border-teal-200/70 bg-teal-50/80 px-2 py-2 shadow-sm ${compact ? "max-w-[150px]" : "px-3"}`}>
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-teal-700 text-xs font-black text-white">
        UD
      </span>
      <div className={compact ? "hidden" : "hidden sm:block"}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Demo session</p>
        <p className="text-sm font-semibold text-ink">Urban Demo</p>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="rounded-2xl border border-teal-200 bg-white px-2.5 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-50"
      >
        Sign out
      </button>
    </div>
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
          <div className="min-w-0 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: brand.themeColor }} />
            <p className="max-w-[118px] truncate text-sm font-semibold sm:max-w-none">{brand.name}</p>
          </div>
          <UserProfileControl compact />
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 hidden items-center justify-between rounded-[28px] border border-white/70 bg-white/68 px-4 py-3 shadow-sm backdrop-blur-2xl lg:flex">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Admin portal</p>
              <p className="mt-1 text-sm font-semibold text-ink">Manage AI support for {brand.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-72">
                <WorkspaceSelector brandId={brandId} onBrandChange={onBrandChange} compact />
              </div>
              <UserProfileControl />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
