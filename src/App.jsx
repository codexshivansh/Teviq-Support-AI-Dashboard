import { AnimatePresence, motion } from "framer-motion";
import { Layout } from "./components/Layout";
import { DEFAULT_BRAND_ID } from "./data/brands";
import { Home } from "./pages/Home";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { Playground } from "./pages/Playground";
import { ShopifyStatus } from "./pages/ShopifyStatus";
import { AnalyticsPreview } from "./pages/AnalyticsPreview";
import { Settings } from "./pages/Settings";
import { Conversations } from "./pages/Conversations";
import { WidgetInstall } from "./pages/WidgetInstall";
import { useEffect, useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { useTeviqAuth } from "./auth/AuthContext";
import { setAuthTokenGetter } from "./services/api";

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

export default function App() {
  const auth = useTeviqAuth();
  const [activePage, setActivePage] = useState(() => pageFromPath(window.location.pathname));
  const [brandId, setBrandId] = useState(getInitialBrandId);
  const Page = pages[activePage] || Home;

  useEffect(() => {
    setAuthTokenGetter(auth.getAuthToken);
  }, [auth]);

  useEffect(() => {
    try {
      localStorage.setItem("teviq:selectedBrandId", brandId);
    } catch {
      // Local storage can be unavailable in restricted browsers; ignore for demo mode.
    }
  }, [brandId]);

  useEffect(() => {
    const handlePopState = () => setActivePage(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(pageId) {
    setActivePage(pageId);
    const path = pagePaths[pageId] || "/";
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  }

  if (!auth.isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">
        <div className="rounded-3xl border border-line bg-white px-5 py-4 text-sm font-semibold shadow-card">
          Loading secure workspace...
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout activePage={activePage} onNavigate={navigate} brandId={brandId} onBrandChange={setBrandId}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <Page brandId={brandId} onBrandChange={setBrandId} onNavigate={navigate} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
