export interface Palette {
  color: string;
  bg: string;
  badgeBg: string;
  border: string;
}

export const CATEGORY_PALETTE: Palette[] = [
  {
    color: "#fb7c2f",
    bg: "#fff7ed",
    badgeBg: "#ffedd5",
    border: "1px solid rgba(255, 237, 213, 0.6)",
  },
  {
    color: "#3b82f6",
    bg: "#eff6ff",
    badgeBg: "#dbeafe",
    border: "1px solid rgba(219, 234, 254, 0.6)",
  },
  {
    color: "#a855f7",
    bg: "#faf5ff",
    badgeBg: "#f3e8ff",
    border: "1px solid rgba(243, 232, 255, 0.6)",
  },
  {
    color: "#f43f5e",
    bg: "#fff1f2",
    badgeBg: "#ffe4e6",
    border: "1px solid rgba(255, 228, 230, 0.6)",
  },
  {
    color: "#eab308",
    bg: "#fefce8",
    badgeBg: "#fef3c7",
    border: "1px solid rgba(254, 243, 199, 0.6)",
  },
];

export const OTHER_PALETTE: Palette = {
  color: "#64748b",
  bg: "#f8fafc",
  badgeBg: "#f1f5f9",
  border: "1px solid rgba(226, 232, 240, 0.7)",
};
export function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("groc") || n.includes("food")) return "shopping_cart";
  if (n.includes("fuel") || n.includes("transp")) return "local_gas_station";
  if (n.includes("hous") || n.includes("util")) return "home";
  if (n.includes("health") || n.includes("здоров")) return "medical_services";
  if (n.includes("caf") || n.includes("rest") || n.includes("entertainment"))
    return "local_cafe";
  if (n.includes("tech")) return "devices";
  if (n.includes("other")) return "more_horiz";

  return "category";
}
