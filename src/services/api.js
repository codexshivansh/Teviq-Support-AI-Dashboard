export const API_BASE_URL = "https://teviq-support-ai-backend.onrender.com";

let authTokenGetter = null;
let demoSessionGetter = () => false;

export function setAuthTokenGetter(getter, options = {}) {
  authTokenGetter = getter;
  demoSessionGetter = options.isDemoSession || (() => false);
}

function wait(ms) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

async function getAuthToken({ required = false } = {}) {
  if (!authTokenGetter) return null;

  const attempts = required ? 3 : 1;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const token = await authTokenGetter();
    if (token) return token;
    if (attempt < attempts - 1) await wait(180);
  }

  return null;
}

async function request(path, options = {}) {
  const { requiresAuth = false, ...fetchOptions } = options;
  const token = await getAuthToken({ required: requiresAuth });
  const authHeaders = {};

  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  } else if (demoSessionGetter()) {
    authHeaders["x-teviq-demo-auth"] = "true";
  } else if (requiresAuth) {
    throw new Error("Secure session is not ready. Please sign out and sign in again.");
  }

  const headers = fetchOptions.body instanceof FormData
    ? {
        ...authHeaders,
        ...(fetchOptions.headers || {})
      }
    : {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(fetchOptions.headers || {})
      };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || data?.reply || `Request failed with ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  getKnowledgeDocuments(brandId) {
    return request(`/api/knowledge/${brandId}/documents`, { requiresAuth: true });
  },
  uploadKnowledgeDocument(brandId, formData) {
    return request(`/api/knowledge/${brandId}/upload`, {
      requiresAuth: true,
      method: "POST",
      body: formData
    });
  },
  deleteKnowledgeDocument(brandId, documentId) {
    return request(`/api/knowledge/${brandId}/documents/${documentId}`, {
      requiresAuth: true,
      method: "DELETE"
    });
  },
  getKnowledgePolicies(brandId, search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/api/knowledge/${brandId}/policies${query}`, { requiresAuth: true });
  },
  createKnowledgePolicy(brandId, payload) {
    return request(`/api/knowledge/${brandId}/policies`, {
      requiresAuth: true,
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateKnowledgePolicy(brandId, policyId, payload) {
    return request(`/api/knowledge/${brandId}/policies/${policyId}`, {
      requiresAuth: true,
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  deleteKnowledgePolicy(brandId, policyId) {
    return request(`/api/knowledge/${brandId}/policies/${policyId}`, {
      requiresAuth: true,
      method: "DELETE"
    });
  },
  getKnowledgeFaqs(brandId, search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/api/knowledge/${brandId}/faqs${query}`, { requiresAuth: true });
  },
  createKnowledgeFaq(brandId, payload) {
    return request(`/api/knowledge/${brandId}/faqs`, {
      requiresAuth: true,
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateKnowledgeFaq(brandId, faqId, payload) {
    return request(`/api/knowledge/${brandId}/faqs/${faqId}`, {
      requiresAuth: true,
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  deleteKnowledgeFaq(brandId, faqId) {
    return request(`/api/knowledge/${brandId}/faqs/${faqId}`, {
      requiresAuth: true,
      method: "DELETE"
    });
  },
  saveOnboardingBrandSetup(payload) {
    return request("/api/onboarding/brand-setup", {
      requiresAuth: true,
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getOnboardingShopifyStatus(brandId) {
    return request(`/api/onboarding/shopify/status?brandId=${encodeURIComponent(brandId)}`, {
      requiresAuth: true
    });
  },
  testOnboardingShopifyConnection(payload) {
    return request("/api/onboarding/shopify/test-connection", {
      requiresAuth: true,
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  completeOnboarding() {
    return request("/api/onboarding/complete", {
      requiresAuth: true,
      method: "POST"
    });
  },
  chat({ brandId, message, customerId }) {
    return request("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        brandId,
        message,
        customerId
      })
    });
  },
  getShopifyStatus(brandId) {
    return request(`/api/integrations/shopify/${brandId}/status`, { requiresAuth: true });
  },
  syncShopify(brandId) {
    return request(`/api/integrations/shopify/${brandId}/sync`, {
      requiresAuth: true,
      method: "POST"
    });
  },
  getShopifyProducts(brandId) {
    return request(`/api/integrations/shopify/${brandId}/products`, { requiresAuth: true });
  },
  getAnalytics(brandId, days = 30) {
    return request(`/api/analytics/${brandId}?days=${days}`, { requiresAuth: true });
  },
  getBrands() {
    return request("/api/brands", { requiresAuth: true });
  }
};
