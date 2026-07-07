export const BRANDS = [
  {
    id: "vastra-demo",
    name: "Vastra Demo",
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
    name: "Beauty Demo",
    industry: "Beauty",
    themeColor: "#db2777"
  }
];

export const DEFAULT_BRAND_ID = "urban-demo";

function titleFromBrandId(brandId) {
  return String(brandId || "Workspace")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getBrand(brandId) {
  const knownBrand = BRANDS.find((brand) => brand.id === brandId);
  if (knownBrand) return knownBrand;

  return {
    id: brandId,
    name: titleFromBrandId(brandId),
    industry: "Brand workspace",
    themeColor: "#0f172a"
  };
}
