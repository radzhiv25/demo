// Family profile stored in localStorage on the client.
// The server receives it as JSON in every chat API call.

export interface FamilyProfile {
  members: number;
  dietaryPrefs: string[];
  allergies: string[];
  budgetINR: number;
  addressId: string;
  addressLabel: string;
}

const KEY = "mealpilot_family_profile";

export function saveProfile(profile: FamilyProfile): void {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function loadProfile(): FamilyProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FamilyProfile;
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  localStorage.removeItem(KEY);
}

export const DEFAULT_PROFILE: FamilyProfile = {
  members: 4,
  dietaryPrefs: ["vegetarian"],
  allergies: [],
  budgetINR: 800,
  addressId: "addr_001",
  addressLabel: "Home",
};

export const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "high-protein", label: "High Protein" },
  { value: "low-calorie", label: "Low Calorie" },
  { value: "low-carb", label: "Low Carb" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "no-onion-garlic", label: "No Onion/Garlic" },
];
