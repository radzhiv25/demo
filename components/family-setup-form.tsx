"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { loadProfile, saveProfile, DIETARY_OPTIONS, type FamilyProfile } from "@/lib/family-profile";
import type { SwiggyAddress } from "@/lib/swiggy/types";
import { cn } from "@/lib/utils";
import { Check, Crosshair, MapPin, Minus, Plus } from "lucide-react";

type AddressCategory = "HOME" | "WORK" | "OFFICE" | "FRIENDS_AND_FAMILY" | "OTHER";

const ADDRESS_CATEGORIES: { value: AddressCategory; label: string }[] = [
  { value: "HOME", label: "Home" },
  { value: "WORK", label: "Work" },
  { value: "OFFICE", label: "Office" },
  { value: "FRIENDS_AND_FAMILY", label: "Friends & family" },
  { value: "OTHER", label: "Other" },
];

export function FamilySetupForm() {
  const router = useRouter();
  const [members, setMembers] = useState(4);
  const [budget, setBudget] = useState(800);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(["vegetarian"]);
  const [allergies, setAllergies] = useState("");
  const [addresses, setAddresses] = useState<SwiggyAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullAddress: "",
    userName: "",
    userPhone: "",
    addressCategory: "HOME" as AddressCategory,
    addressTag: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadAddresses() {
      try {
        const savedProfile = loadProfile();
        if (savedProfile) {
          setMembers(savedProfile.members);
          setBudget(savedProfile.budgetINR);
          setDietaryPrefs(savedProfile.dietaryPrefs);
          setAllergies(savedProfile.allergies.join(", "));
        }

        const response = await fetch("/api/addresses");
        const payload = (await response.json()) as {
          addresses?: SwiggyAddress[];
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error ?? "Unable to load saved addresses.");
        if (!isCurrent) return;

        const savedAddresses = payload.addresses ?? [];
        setAddresses(savedAddresses);
        const savedAddressStillExists = savedAddresses.some(
          (address) => address.addressId === savedProfile?.addressId
        );
        setSelectedAddressId(
          savedAddressStillExists ? savedProfile!.addressId : savedAddresses[0]?.addressId ?? ""
        );
        if (!savedAddresses.length) {
          setAddressError("No saved Swiggy addresses were found. Add one below to continue.");
        }
      } catch (error) {
        if (isCurrent) {
          setAddressError(error instanceof Error ? error.message : "Unable to load saved addresses.");
        }
      } finally {
        if (isCurrent) setIsLoadingAddresses(false);
      }
    }

    void loadAddresses();
    return () => {
      isCurrent = false;
    };
  }, []);

  function toggleDiet(value: string) {
    setDietaryPrefs((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function buildProfile(selectedAddress: SwiggyAddress): FamilyProfile {
    return {
      members,
      dietaryPrefs,
      allergies: allergies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      budgetINR: budget,
      addressId: selectedAddress.addressId,
      addressLabel: selectedAddress.label,
      addressDisplay: selectedAddress.fullAddress,
    };
  }

  function selectAddress(address: SwiggyAddress) {
    setSelectedAddressId(address.addressId);
    setAddressError("");
    saveProfile(buildProfile(address));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setAddressError("Your browser does not support location access. Enter the address manually.");
      return;
    }

    setIsLocating(true);
    setAddressError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewAddress((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setIsLocating(false);
      },
      () => {
        setAddressError("We could not access your location. Check browser permission or enter the address manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  async function saveNewAddress() {
    if (!newAddress.fullAddress || !newAddress.userName || !newAddress.userPhone) {
      setAddressError("Enter your complete address, name, and phone number to save this location.");
      return;
    }

    setIsSavingAddress(true);
    setAddressError("");
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const payload = (await response.json()) as { address?: SwiggyAddress; error?: string };
      if (!response.ok || !payload.address) throw new Error(payload.error ?? "Unable to save this address.");

      setAddresses((current) => [...current, payload.address!]);
      setSelectedAddressId(payload.address.addressId);
      saveProfile(buildProfile(payload.address));
      setIsAddingAddress(false);
      setNewAddress({
        fullAddress: "", userName: "", userPhone: "", addressCategory: "HOME", addressTag: "",
        latitude: undefined, longitude: undefined,
      });
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "Unable to save this address.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selectedAddress = addresses.find((address) => address.addressId === selectedAddressId);
    if (!selectedAddress) {
      setAddressError("Choose a delivery address before continuing.");
      return;
    }
    setSaving(true);
    saveProfile(buildProfile(selectedAddress));
    router.push("/chat");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Delivery address */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Delivery location
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Choose the saved Swiggy address where you want meals delivered.
        </p>

        {isLoadingAddresses ? (
          <div className="border border-border rounded-xl px-3 py-3 text-sm text-muted-foreground">
            Loading saved addresses…
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-2">
            {addresses.map((address) => {
              const isSelected = address.addressId === selectedAddressId;
              return (
                <button
                  key={address.addressId}
                  type="button"
                  onClick={() => selectAddress(address)}
                  className={cn(
                    "w-full flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <MapPin className="size-4 shrink-0 mt-0.5 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{address.label}</span>
                    <span className="block text-xs leading-relaxed text-muted-foreground mt-0.5">
                      {address.fullAddress}
                    </span>
                  </span>
                  {isSelected && <Check className="size-4 shrink-0 mt-0.5 text-primary" />}
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setIsAddingAddress((current) => !current);
            setAddressError("");
          }}
          className="text-sm font-medium text-primary mt-3 hover:underline"
        >
          {isAddingAddress ? "Cancel adding an address" : "+ Add a new delivery location"}
        </button>

        {isAddingAddress && (
          <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">New delivery location</p>
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-xs font-medium text-primary disabled:opacity-60"
              >
                <Crosshair className="size-3.5" />
                {isLocating ? "Finding you…" : "Use my current location"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {newAddress.latitude !== undefined
                ? "Current location captured. Add your complete delivery address to save it."
                : "Add your full address, including city and 6-digit PIN code."}
            </p>
            <textarea
              value={newAddress.fullAddress}
              onChange={(event) => setNewAddress((current) => ({ ...current, fullAddress: event.target.value }))}
              placeholder="e.g. Flat 12B, 100 Feet Road, Indiranagar, Bengaluru 560038"
              rows={3}
              className="w-full resize-none border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={newAddress.userName}
                onChange={(event) => setNewAddress((current) => ({ ...current, userName: event.target.value }))}
                placeholder="Your name"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary"
              />
              <input
                inputMode="tel"
                value={newAddress.userPhone}
                onChange={(event) => setNewAddress((current) => ({ ...current, userPhone: event.target.value }))}
                placeholder="Your phone number"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {ADDRESS_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setNewAddress((current) => ({ ...current, addressCategory: category.value }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    newAddress.addressCategory === category.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <input
              value={newAddress.addressTag}
              onChange={(event) => setNewAddress((current) => ({ ...current, addressTag: event.target.value }))}
              placeholder="Location label (optional), e.g. Grandma's home"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary"
            />
            <Button type="button" onClick={saveNewAddress} disabled={isSavingAddress} className="w-full">
              {isSavingAddress ? "Saving location…" : "Save delivery location"}
            </Button>
          </div>
        )}

        {addressError && (
          <p className="text-xs text-destructive mt-2" role="alert">{addressError}</p>
        )}
      </div>

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
        disabled={saving || isLoadingAddresses || !selectedAddressId}
      >
        {saving ? "Saving..." : "Save & Go to MealPilot"}
      </Button>
    </form>
  );
}
