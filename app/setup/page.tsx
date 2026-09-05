import Link from "next/link";
import { Salad } from "lucide-react";
import { FamilySetupForm } from "@/components/family-setup-form";

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/50">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Salad className="size-5 text-primary" />
            <span className="font-semibold text-foreground">MealPilot</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Set up your family profile
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tell MealPilot about your family so it can suggest the right healthy
            meals every time. You can update this anytime.
          </p>
        </div>

        <FamilySetupForm />
      </main>
    </div>
  );
}
