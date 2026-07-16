import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { DEFAULT_BRAND_ID, DEMO_BRAND_ID } from "./data/brands";
import { useBrands } from "./hooks/useBrands";
import { LoginPage } from "./components/LoginPage";
import { useTeviqAuth } from "./auth/AuthContext";
import { setAuthTokenGetter } from "./services/api";

const ONBOARDING_MINIMIZED_KEY = "teviq_onboarding_minimized";

function lazyNamed(factory, exportName) {
  return lazy(() => factory().then((module) => ({ default: module[exportName] })));
}

const Home = lazyNamed(() => import("./pages/Home"), "Home");
const Conversations = lazyNamed(() => import("./pages/Conversations"), "Conversations");
const KnowledgeBase = lazyNamed(() => import("./pages/KnowledgeBase"), "KnowledgeBase");
const Playground = lazyNamed(() => import("./pages/Playground"), "Playground");
const ShopifyStatus = lazyNamed(() => import("./pages/ShopifyStatus"), "ShopifyStatus");
const AnalyticsPreview = lazyNamed(() => import("./pages/AnalyticsPreview"), "AnalyticsPreview");
const WidgetInstall = lazyNamed(() => import("./pages/WidgetInstall"), "WidgetInstall");
const Settings = lazyNamed(() => import("./pages/Settings"), "Settings");
const Onboarding = lazyNamed(() => import("./pages/Onboarding"), "Onboarding");

const pages = {
  home: Home,
  conversations: Conversations,
  knowledge: KnowledgeBase,
  playground: Playground,
  shopify: ShopifyStatus,
  analytics: AnalyticsPreview,
  "widget-install": WidgetInstall,
  settings: Settings
};

const pagePaths = {
  home: "/",
  conversations: "/conversations",
  knowledge: "/knowledge",
  playground: "/playground",
  shopify: "/shopify",
  analytics: "/analytics",
  "widget-install": "/widget-install",
  settings: "/settings"
};

function pageFromPath(pathname) {
  const found = Object.entries(pagePaths).find(([, path]) => path === pathname);
  return found?.[0] || "home";
}

function getInitialBrandId() {
  try {
    return localStorage.getItem("teviq:selectedBrandId") || DEFAULT_BRAND_ID;
  } catch {
    return DEFAULT_BRAND_ID;
  }
}

function getBrandIdFromMetadata(metadata = {}, brands = []) {
  const candidates = [
    metadata.brandId,
    metadata.brand_id,
    metadata.workspaceBrandId,
    metadata.workspace_brand_id
  ];

  return candidates.find((candidate) => {
    if (typeof candidate !== "string") return false;
    if (brands.some((brand) => brand.id === candidate)) return true;
    return Boolean(metadata.brand_name) && /^[a-z0-9-]+$/.test(candidate);
  }) || "";
}

function BrandNotConfigured({ onSignOut }) {
  return (
    // Fixed light page background regardless of dashboard theme, so the
    // --color-* vars are pinned to light values here too (see the same
    // pattern/reasoning in OnboardingWizard.jsx's StepShell).
    <div
      className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_34%),#f8fafc] px-4 text-ink"
      style={{
        "--color-ink": "15 23 42",
        "--color-muted": "100 116 139",
        "--color-line": "226 232 240",
        "--color-panel": "rgba(255, 255, 255, 0.78)",
        colorScheme: "light"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24 }}
        className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white/82 p-8 text-center shadow-card backdrop-blur-2xl"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
          T
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-muted">Workspace setup required</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Brand not configured yet.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
          Contact Teviq support to complete setup.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-7 inline-flex items-center justify-center rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-950/10"
        >
          Sign out
        </button>
      </motion.div>
    </div>
  );
}

function WorkspaceLoading({ fullScreen = false }) {
  return (
    <div
      className={`${fullScreen ? "min-h-screen" : "min-h-[360px]"} grid place-items-center bg-slate-50/40 text-slate-500 dark:bg-slate-950/20 dark:text-slate-400`}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-3xl border border-line bg-white px-5 py-4 text-sm font-semibold shadow-card dark:bg-slate-900 dark:text-slate-200">
        Loading secure workspace...
      </div>
    </div>
  );
}

export default function App() {
  const auth = useTeviqAuth();
  const { brands, loading: brandsLoading } = useBrands(auth.isAuthenticated);
  const [activePage, setActivePage] = useState(() => pageFromPath(window.location.pathname));
  const [brandId, setBrandId] = useState(getInitialBrandId);
  const [onboardingCompleteOverride, setOnboardingCompleteOverride] = useState(false);
  const [onboardingMinimized, setOnboardingMinimized] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_MINIMIZED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const Page = pages[activePage] || Home;
  const user = auth.user;
  const publicMetadata = user?.publicMetadata || {};
  const isTeviqAdmin = !auth.isDemoSession && publicMetadata.role === "teviq_admin";
  const canSelectWorkspace = isTeviqAdmin || auth.isDemoSession;
  const onboardingComplete = publicMetadata.onboarding_complete === true || onboardingCompleteOverride;
  const shouldShowOnboarding = !auth.isDemoSession && !isTeviqAdmin && !onboardingComplete && !onboardingMinimized;
  const assignedBrandId = getBrandIdFromMetadata(publicMetadata, brands);
  const hasAssignedBrand = Boolean(assignedBrandId);
  const storedBrandIsValid = brandsLoading ? true : brands.some((brand) => brand.id === brandId);
  const activeBrandId = canSelectWorkspace
    ? (storedBrandIsValid ? brandId : auth.isDemoSession ? DEMO_BRAND_ID : DEFAULT_BRAND_ID)
    : assignedBrandId;
  const handleBrandChange = canSelectWorkspace ? setBrandId : undefined;

  setAuthTokenGetter(auth.getAuthToken, {
    isDemoSession: () => auth.isDemoSession
  });

  useEffect(() => {
    setAuthTokenGetter(auth.getAuthToken, {
      isDemoSession: () => auth.isDemoSession
    });
  }, [auth]);

  useEffect(() => {
    if (!activeBrandId) return;
    try {
      localStorage.setItem("teviq:selectedBrandId", activeBrandId);
    } catch {
      // Local storage can be unavailable in restricted browsers; ignore for demo mode.
    }
  }, [activeBrandId]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (brandId === activeBrandId) return;
    setBrandId(activeBrandId);
  }, [activeBrandId, auth.isAuthenticated, brandId]);

  useEffect(() => {
    const handlePopState = () => setActivePage(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(pageId) {
    setOnboardingMinimized(() => {
      try {
        return localStorage.getItem(ONBOARDING_MINIMIZED_KEY) === "true";
      } catch {
        return false;
      }
    });
    setActivePage(pageId);
    const path = pagePaths[pageId] || "/";
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  }

  if (!auth.isLoaded) {
    return <WorkspaceLoading fullScreen />;
  }

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  if (shouldShowOnboarding) {
    return (
      <Suspense fallback={<WorkspaceLoading fullScreen />}>
        <Onboarding
          metadata={publicMetadata}
          refreshUser={auth.refreshUser}
          onNavigate={navigate}
          onComplete={() => {
            setOnboardingCompleteOverride(true);
            setOnboardingMinimized(false);
            navigate("home");
          }}
        />
      </Suspense>
    );
  }

  if (!canSelectWorkspace && !hasAssignedBrand) {
    return <BrandNotConfigured onSignOut={auth.signOut} />;
  }

  return (
    <Layout activePage={activePage} onNavigate={navigate} brandId={activeBrandId} onBrandChange={handleBrandChange}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<WorkspaceLoading />}>
            <Page brandId={activeBrandId} onBrandChange={handleBrandChange} onNavigate={navigate} />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
