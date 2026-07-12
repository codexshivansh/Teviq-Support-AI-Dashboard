import {
  BarChart3,
  Bot,
  Code2,
  Database,
  Home,
  LogOut,
  Menu,
  MessagesSquare,
  Monitor,
  Moon,
  MoreVertical,
  Settings,
  ShoppingBag,
  Sparkles,
  Sun,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTeviqAuth } from "../auth/AuthContext";
import { getBrand } from "../data/brands";
import { useBrands } from "../hooks/useBrands";
import { useTheme } from "../theme/ThemeContext";

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
    <div className={`block rounded-3xl border border-line/80 bg-white/78 shadow-sm dark:bg-white/5 ${compact ? "px-3 py-2" : "p-3"}`}>
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
    <aside className="flex h-full w-72 flex-col border-r border-white/70 bg-white/72 px-4 py-5 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90 lg:w-76">
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
          className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white lg:hidden dark:bg-white/5"
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
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-white hover:text-ink dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-line/80 bg-white/75 p-4 dark:bg-white/5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
          {isDemoSession ? "Demo mode" : "Secure workspace"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {isDemoSession
            ? "Instant Urban Demo access for client walkthroughs."
            : "Authenticated access for knowledge, connectors and workspace setup."}
        </p>
      </div>
    </aside>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Default", icon: Monitor }
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">Theme</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-white text-ink shadow-sm dark:bg-slate-800"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProfileMenu({ avatar, name, subtitle, onSignOut, compact }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative z-40">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`relative z-10 flex items-center gap-1.5 rounded-3xl border border-line/80 bg-white/78 p-1.5 shadow-sm transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 ${compact ? "" : "pr-2"}`}
      >
        {avatar}
        <MoreVertical className="h-4 w-4 text-muted" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-slate-950/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-label="Close account menu"
          tabIndex={-1}
        />
      ) : null}

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-3xl border border-line/80 bg-white shadow-card dark:border-white/10 dark:bg-slate-900"
        >
          <div className="flex items-center gap-3 border-b border-line/70 p-4 dark:border-white/10">
            {avatar}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
              <p className="truncate text-xs text-muted">{subtitle}</p>
            </div>
          </div>

          <div className="p-4">
            <ThemeSwitcher />
          </div>

          <div className="border-t border-line/70 p-2 dark:border-white/10">
            <button
              type="button"
              onClick={onSignOut}
              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UserProfileControl({ compact = false }) {
  const { isDemoSession, signOut, user } = useTeviqAuth();

  if (!isDemoSession && user) {
    const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || "Teviq user";
    const email = user.primaryEmailAddress?.emailAddress || "";
    const imageUrl = user.imageUrl;

    const avatar = imageUrl ? (
      <img src={imageUrl} alt="" className="h-9 w-9 rounded-2xl object-cover" />
    ) : (
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white dark:bg-white dark:text-slate-950">
        {displayName.slice(0, 2).toUpperCase()}
      </span>
    );

    return <ProfileMenu avatar={avatar} name={displayName} subtitle={email || "Signed in"} onSignOut={signOut} compact={compact} />;
  }

  const avatar = (
    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-teal-700 text-xs font-black text-white">
      UD
    </span>
  );

  return <ProfileMenu avatar={avatar} name="Urban Demo" subtitle="Demo session" onSignOut={signOut} compact={compact} />;
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/70 bg-white/70 px-4 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80 lg:hidden">
          <button
            className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-white dark:bg-white/5"
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
          <div className="mb-6 hidden items-center justify-between rounded-[28px] border border-white/70 bg-white/68 px-4 py-3 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 lg:flex">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Admin portal</p>
              <p className="mt-1 text-sm font-semibold text-ink">Manage AI support for {brand.name}</p>
            </div>
            {/* Workspace switching lives in the sidebar only (see WorkspaceSelector above) — this used
               to render a second, duplicate switcher here plus a third one via PageHeader. */}
            <UserProfileControl />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
