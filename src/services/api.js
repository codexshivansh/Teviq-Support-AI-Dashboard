export const API_BASE_URL = "https://teviq-support-ai-backend.onrender.com";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: options.body instanceof FormData
      ? options.headers
      : {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
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
    return request(`/api/knowledge/${brandId}/documents`);
  },
  uploadKnowledgeDocument(brandId, formData) {
    return request(`/api/knowledge/${brandId}/upload`, {
      method: "POST",
      body: formData
    });
  },
  deleteKnowledgeDocument(brandId, documentId) {
    return request(`/api/knowledge/${brandId}/documents/${documentId}`, {
      method: "DELETE"
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
    return request(`/api/integrations/shopify/${brandId}/status`);
  },
  syncShopify(brandId) {
    return request(`/api/integrations/shopify/${brandId}/sync`, {
      method: "POST"
    });
  },
  getShopifyProducts(brandId) {
    return request(`/api/integrations/shopify/${brandId}/products`);
  }
};
