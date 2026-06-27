export const BRANDS = [
  {
    id: "vastra-demo",
    name: "Teviq Vastra Demo",
    industry: "Fashion",
    themeColor: "#7c3aed"
  },
  {
    id: "urban-demo",
    name: "Urban Gadgets Demo",
    industry: "Electronics",
    themeColor: "#0f766e"
  },
  {
    id: "beauty-demo",
    name: "GlowCare Beauty Demo",
    industry: "Beauty",
    themeColor: "#db2777"
  }
];

export const DEFAULT_BRAND_ID = "urban-demo";

export function getBrand(brandId) {
  return BRANDS.find((brand) => brand.id === brandId) || BRANDS[0];
}
