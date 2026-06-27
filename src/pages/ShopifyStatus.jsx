import { useEffect, useState } from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card, MetricCard } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { api } from "../services/api";

function formatDate(value) {
  if (!value) return "Not synced";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ShopifyStatus({ brandId, onBrandChange }) {
  const [status, setStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [statusData, productData] = await Promise.all([
        api.getShopifyStatus(brandId),
        api.getShopifyProducts(brandId)
      ]);
      setStatus(statusData);
      setProducts(productData.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [brandId]);

  async function sync() {
    setSyncing(true);
    setError("");
    try {
      const data = await api.syncShopify(brandId);
      setStatus((current) => ({
        ...(current || {}),
        lastSyncedAt: data.syncedAt,
        productCount: data.imported?.products || current?.productCount || 0,
        orderCount: data.imported?.orders || current?.orderCount || 0,
        status: data.ok ? "connected" : "not_configured"
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Connector preview"
        title="Shopify Status"
        description="Demo-only Shopify-style catalog and order connector. No OAuth or live Shopify calls yet."
        brandId={brandId}
        onBrandChange={onBrandChange}
        action={
          <Button onClick={sync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing" : "Sync demo"}
          </Button>
        }
      />

      {loading ? <LoadingState label="Loading Shopify demo connector" /> : null}
      {error && !loading ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard icon={ShoppingBag} label="Status" value={status?.status === "connected" ? "Connected" : "Not ready"} detail={status?.mode || "demo"} tone="green" />
            <MetricCard label="Products" value={status?.productCount || 0} detail="Demo catalog items" />
            <MetricCard label="Orders" value={status?.orderCount || 0} detail="Demo order records" />
            <MetricCard label="Last synced" value={formatDate(status?.lastSyncedAt)} detail="Local JSON sync" />
          </div>

          <Card className="mt-5">
            <p className="text-sm font-semibold text-ink">Categories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(status?.categories || []).map((category) => (
                <span key={category} className="rounded-full border border-line bg-white/75 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {category}
                </span>
              ))}
            </div>
          </Card>

          <Card className="mt-5 overflow-hidden p-0">
            {products.length ? (
              <div className="overflow-x-auto teviq-scrollbar">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-[0.14em] text-muted">
                    <tr>
                      <th className="px-5 py-4">Product</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Price</th>
                      <th className="px-5 py-4">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/70">
                    {products.map((product) => (
                      <tr key={product.id} className="bg-white/45">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-ink">{product.title}</p>
                          <p className="text-xs text-muted">{product.handle}</p>
                        </td>
                        <td className="px-5 py-4 text-muted">{product.category}</td>
                        <td className="px-5 py-4 font-medium">{product.currency} {product.price}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
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
                <EmptyState title="No demo products" description="This brand does not have Shopify demo catalog data configured yet." />
              </div>
            )}
          </Card>
        </>
      ) : null}
    </>
  );
}
