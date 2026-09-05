"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveProfile, DIETARY_OPTIONS, type FamilyProfile } from "@/lib/family-profile";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

export function FamilySetupForm() {
  const router = useRouter();
  const [members, setMembers] = useState(4);
  const [budget, setBudget] = useState(800);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(["vegetarian"]);
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleDiet(value: string) {
    setDietaryPrefs((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const profile: FamilyProfile = {
      members,
      dietaryPrefs,
      allergies: allergies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      budgetINR: budget,
      addressId: "addr_001",
      addressLabel: "Home",
    };
    saveProfile(profile);
    router.push("/chat");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Family size */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          How many people are you feeding?
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMembers(Math.max(1, members - 1))}
            className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus className="size-4" />
          </button>
          <span className="text-3xl font-semibold w-8 text-center">{members}</span>
          <button
            type="button"
            onClick={() => setMembers(Math.min(10, members + 1))}
            className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="size-4" />
          </button>
          <span className="text-sm text-muted-foreground ml-2">
            {members === 1 ? "person" : "people"}
          </span>
        </div>
      </div>

      {/* Dietary preferences */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Dietary preferences{" "}
          <span className="text-muted-foreground font-normal">(pick all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleDiet(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                dietaryPrefs.includes(opt.value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Any allergies?{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. nuts, gluten, dairy"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Meal budget per order
          <span className="ml-2 text-primary font-semibold">₹{budget}</span>
          <span className="text-muted-foreground font-normal ml-1 text-xs">
            (max ₹1000 on Swiggy Builders)
          </span>
        </label>
        <input
          type="range"
          min={200}
          max={1000}
          step={50}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-primary h-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹200</span>
          <span>₹1000</span>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-11 text-sm font-semibold rounded-xl"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save & Go to MealPilot"}
      </Button>
    </form>
  );
}
