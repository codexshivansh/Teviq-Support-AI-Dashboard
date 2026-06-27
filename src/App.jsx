import { AnimatePresence, motion } from "framer-motion";
import { Layout } from "./components/Layout";
import { DEFAULT_BRAND_ID } from "./data/brands";
import { Home } from "./pages/Home";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { Playground } from "./pages/Playground";
import { ShopifyStatus } from "./pages/ShopifyStatus";
import { AnalyticsPreview } from "./pages/AnalyticsPreview";
import { Settings } from "./pages/Settings";
import { useState } from "react";

const pages = {
  home: Home,
  knowledge: KnowledgeBase,
  playground: Playground,
  shopify: ShopifyStatus,
  analytics: AnalyticsPreview,
  settings: Settings
};

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [brandId, setBrandId] = useState(DEFAULT_BRAND_ID);
  const Page = pages[activePage] || Home;

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <Page brandId={brandId} onBrandChange={setBrandId} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
