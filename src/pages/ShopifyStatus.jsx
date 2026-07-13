import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Unplug
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

const OAUTH_ERROR_MESSAGES = {
  invalid_shopify_callback: "Shopify could not verify the authorization request. Please try connecting again.",
  shopify_oauth_state_missing: "The connection request expired or was already used. Please start again.",
  shopify_oauth_state_expired: "The connection request expired. Please start again.",
  shopify_store_mismatch: "The approved store did not match the store you entered. Please try again.",
  shopify_store_already_connected: "That Shopify store is already connected to another Teviq workspace."
};

function formatDate(value) {
  if (!value) return "Not synced yet";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function readOauthNotice() {
  const params = new URLSearchParams(window.location.search);
  const result = params.get("shopify");
  if (!result) return null;

  const notice = result === "connected"
    ? { type: "success", message: "Shopify connected successfully. Your first store sync is ready." }
    : {
        type: "error",
        message: OAUTH_ERROR_MESSAGES[params.get("code")] || "Shopify could not be connected. Please try again."
      };

  params.delete("shopify");
  params.delete("code");
  const query = params.toString();
  window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  return notice;
}

function ConnectionPanel({ oauthConfigured, onConnect, connecting }) {
  const [storeUrl, setStoreUrl] = useState("");

  function submit(event) {
    event.preventDefault();
    onConnect(storeUrl);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-line p-6 lg:border-b-0 lg:border-r">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">Connect your Shopify store</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Approve secure read access in Shopify. Teviq will use it to sync products and order status for this workspace.
          </p>
          <div className="mt-5 space-y-3">
            {["Read product catalog", "Read recent order and fulfillment status", "Keep each store isolated to its Teviq workspace"].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form className="flex flex-col justify-center p-6" onSubmit={submit}>
          <label htmlFor="shopify-store-url" className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
            Shopify store address
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="shopify-store-url"
              required
              value={storeUrl}
              onChange={(event) => setStoreUrl(event.target.value)}
              placeholder="your-store.myshopify.com"
              className="min-w-0 flex-1 rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5 dark:bg-white/5 dark:focus:border-slate-500"
            />
            <Button type="submit" disabled={connecting || !oauthConfigured} className="shrink-0">
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              {connecting ? "Opening Shopify" : "Connect Shopify"}
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            Use the permanent <span className="font-semibold text-ink">.myshopify.com</span> address shown in Shopify admin. Teviq never asks you to paste an Admin API token.
          </p>
          {!oauthConfigured ? (
            <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Shopify authorization is not configured for this deployment yet. Contact Teviq support.
            </p>
          ) : null}
        </form>
      </div>
    </Card>
  );
}

export function ShopifyStatus({ brandId, onBrandChange }) {
  const [status, setStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const load = useCallback(async ({ reset = false } = {}) => {
    setLoading(true);
    setError("");
    if (reset) {
      setStatus(null);
      setProducts([]);
    }
    try {
      const statusData = await api.getShopifyStatus(brandId);
      setStatus(statusData);

      if (statusData.connected) {
        const productData = await api.getShopifyProducts(brandId);
        setProducts(productData.products || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    setConfirmDisconnect(false);
    load({ reset: true });
  }, [load]);

  useEffect(() => {
    setNotice(readOauthNotice());
  }, []);

  async function connect(storeUrl) {
    setConnecting(true);
    setError("");
    try {
      const data = await api.startShopifyConnection(brandId, {
        storeUrl,
        returnPath: "/shopify"
      });
      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  }

  async function sync() {
    setSyncing(true);
    setError("");
    try {
      await api.syncShopify(brandId);
      await load();
      setNotice({ type: "success", message: "Shopify data is up to date." });
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function disconnect() {
    setDisconnecting(true);
    setError("");
    try {
      await api.disconnectShopify(brandId);
      setConfirmDisconnect(false);
      setNotice({ type: "success", message: "Shopify has been disconnected from this workspace." });
      await load({ reset: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setDisconnecting(false);
    }
  }

  const connected = Boolean(status?.connected);
  const isDemo = status?.mode === "demo";

  return (
    <>
      <PageHeader
        eyebrow="Commerce integration"
        title="Shopify"
        description={connected
          ? "Keep product and order context available to your Teviq workspace."
          : "Connect Shopify securely to make your catalog and order context available in Teviq."}
        brandId={brandId}
        onBrandChange={onBrandChange}
        action={connected ? (
          <div className="flex flex-wrap gap-2">
            {!isDemo ? (
              confirmDisconnect ? (
                <>
                  <Button variant="danger" onClick={disconnect} disabled={disconnecting}>
                    {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                    {disconnecting ? "Disconnecting" : "Confirm disconnect"}
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmDisconnect(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setConfirmDisconnect(true)}>
                  <Unplug className="h-4 w-4" />
                  Disconnect
                </Button>
              )
            ) : null}
            <Button onClick={sync} disabled={syncing || loading}>
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing" : "Sync now"}
            </Button>
          </div>
        ) : null}
      />

      {notice ? (
        <div
          className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          }`}
          role="status"
        >
          {notice.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <Link2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{notice.message}</span>
        </div>
      ) : null}

      {loading ? <LoadingState label="Checking Shopify connection" /> : null}
      {error && !loading ? <div className="mb-5"><ErrorState message={error} /></div> : null}

      {!loading && !error && !connected ? (
        <ConnectionPanel
          oauthConfigured={Boolean(status?.oauthConfigured)}
          connecting={connecting}
          onConnect={connect}
        />
      ) : null}

      {!loading && !error && connected ? (
        <>
          {isDemo ? (
            <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              This demo workspace uses Teviq's sample Shopify catalog. Client workspaces connect through Shopify authorization.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={ShoppingBag} label="Status" value={status.status === "active" || status.status === "connected" ? "Connected" : "Attention needed"} detail={status.shopName || status.storeHost || (isDemo ? "Demo store" : "Shopify")} tone="green" />
            <MetricCard label="Products" value={status.productCount || 0} detail="Catalog items available" />
            <MetricCard label="Orders" value={status.orderCount || 0} detail="Order records available" />
            <MetricCard label="Last synced" value={formatDate(status.lastSyncedAt)} detail={isDemo ? "Sample connector" : "Secure Shopify sync"} />
          </div>

          <Card className="mt-5">
            <p className="text-sm font-semibold text-ink">Categories</p>
            {status.categories?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {status.categories.map((category) => (
                  <span key={category} className="rounded-full border border-line bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Categories will appear after the first product sync.</p>
            )}
          </Card>

          <Card className="mt-5 overflow-hidden p-0">
            {products.length ? (
              <div className="overflow-x-auto teviq-scrollbar">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-muted dark:bg-white/5">
                    <tr>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {products.map((product) => (
                      <tr key={product.id} className="bg-white/45 dark:bg-transparent">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-ink">{product.title}</p>
                          <p className="text-xs text-muted">{product.handle}</p>
                        </td>
                        <td className="px-5 py-4 text-muted">{product.category}</td>
                        <td className="px-5 py-4 font-medium">{product.currency} {product.price}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            product.available
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                          }`}>
                            {product.available ? "Available" : "Unavailable"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5">
                <EmptyState title="No products synced yet" description="Run a sync to load the latest catalog from Shopify." />
              </div>
            )}
          </Card>
        </>
      ) : null}
    </>
  );
}
