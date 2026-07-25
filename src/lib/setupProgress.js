export function isShopifyConnected(shopify) {
  if (shopify?.connected === true) return true;

  const status = String(shopify?.status || "").trim().toLowerCase();
  return status === "active" || status === "connected";
}

export function getSetupCompletion({ knowledge, shopify, localSetup = {} }) {
  const hasKnowledge = Number(knowledge?.stats?.documentCount || 0) > 0;
  const hasShopify = isShopifyConnected(shopify);
  const hasPlayground = Boolean(localSetup.playground);
  const hasInstall = Boolean(localSetup.install);
  const prerequisitesComplete = hasKnowledge && hasShopify && hasPlayground && hasInstall;

  return {
    knowledge: hasKnowledge,
    shopify: hasShopify,
    playground: hasPlayground,
    install: hasInstall,
    live: prerequisitesComplete && Boolean(localSetup.live)
  };
}
