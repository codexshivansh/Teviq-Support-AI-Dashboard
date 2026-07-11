export const DEFAULT_BRAND_ID = "urban-demo";

function titleFromBrandId(brandId) {
  return String(brandId || "Workspace")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// brands should come from useBrands() (GET /api/brands). Falls back to a
// computed placeholder while that list is loading or if brandId isn't in it.
export function getBrand(brandId, brands = []) {
  const knownBrand = brands.find((brand) => brand.id === brandId);
  if (knownBrand) return knownBrand;

  return {
    id: brandId,
    name: titleFromBrandId(brandId),
    industry: "Brand workspace",
    themeColor: "#0f172a"
  };
}
