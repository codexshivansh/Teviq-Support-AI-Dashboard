import test from "node:test";
import assert from "node:assert/strict";
import { getSetupCompletion, isShopifyConnected } from "../src/lib/setupProgress.js";

test("recognizes the live Shopify status response as connected", () => {
  assert.equal(isShopifyConnected({ connected: true, status: "active" }), true);
  assert.equal(isShopifyConnected({ connected: false, status: "not_connected" }), false);
});

test("keeps compatibility with connected status responses", () => {
  assert.equal(isShopifyConnected({ status: "connected" }), true);
  assert.equal(isShopifyConnected({ status: "active" }), true);
});

test("marks AI Live only after prerequisites and explicit live confirmation", () => {
  const ready = {
    knowledge: { stats: { documentCount: 1 } },
    shopify: { connected: true, status: "active" },
    localSetup: { playground: true, install: true, live: true }
  };

  assert.deepEqual(getSetupCompletion(ready), {
    knowledge: true,
    shopify: true,
    playground: true,
    install: true,
    live: true
  });

  assert.equal(
    getSetupCompletion({
      ...ready,
      localSetup: { playground: true, install: true, live: false }
    }).live,
    false
  );
});

test("does not leave AI Live checked after a required integration disconnects", () => {
  const completion = getSetupCompletion({
    knowledge: { stats: { documentCount: 1 } },
    shopify: { connected: false, status: "not_connected" },
    localSetup: { playground: true, install: true, live: true }
  });

  assert.equal(completion.shopify, false);
  assert.equal(completion.live, false);
});
