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
  const [activePage, setActivePage] = useState(() => pageFromPath(window.location.pathname));
  const [brandId, setBrandId] = useState(getInitialBrandId);
  const Page = pages[activePage] || Home;

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
