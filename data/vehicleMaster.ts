// African market vehicle master.
// Share weighting reflects the real market: Toyota dominates (Hilux above all),
// Suzuki is growing fast, followed by VW / Nissan / Hyundai / Ford.

export interface VehicleEntry {
  brand: string;
  model: string;
}

export const VEHICLES: VehicleEntry[] = [
  { brand: "Toyota", model: "Hilux" },
  { brand: "Toyota", model: "Land Cruiser" },
  { brand: "Toyota", model: "Hiace" },
  { brand: "Toyota", model: "Corolla Cross" },
  { brand: "Toyota", model: "Fortuner" },
  { brand: "Suzuki", model: "Swift" },
  { brand: "Suzuki", model: "Ertiga" },
  { brand: "Suzuki", model: "Baleno" },
  { brand: "Volkswagen", model: "Polo" },
  { brand: "Nissan", model: "NP200" },
  { brand: "Hyundai", model: "Grand i10" },
  { brand: "Ford", model: "Ranger" }
];

export const COUNTRIES: { code: string; name: string; language: "en" | "fr" }[] = [
  { code: "KE", name: "Kenya", language: "en" },
  { code: "NG", name: "Nigeria", language: "en" },
  { code: "ZA", name: "South Africa", language: "en" },
  { code: "TZ", name: "Tanzania", language: "en" },
  { code: "GH", name: "Ghana", language: "en" },
  { code: "CI", name: "Côte d'Ivoire", language: "fr" },
  { code: "SN", name: "Senegal", language: "fr" },
  { code: "CM", name: "Cameroon", language: "fr" }
];

export const SALE_TYPE_LABELS: Record<string, string> = {
  new: "New (authorized)",
  certified_used: "Certified used",
  grey_import: "Grey import"
};
