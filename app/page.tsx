import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Salad,
  Users,
  Zap,
  Eye,
  Search,
  ShoppingCart,
  Package,
  CheckCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: Salad,
    title: "Healthy by default",
    desc: "The agent filters for nutritious options — salads, bowls, millets, grilled proteins — not just what's popular.",
  },
  {
    icon: Users,
    title: "Family-aware",
    desc: "Set your family size, dietary preferences, and budget once. The agent remembers every session.",
  },
  {
    icon: Zap,
    title: "One conversation",
    desc: "Just say what you need. The AI searches Swiggy, builds the cart, and places the order — no app-switching.",
  },
  {
    icon: Eye,
    title: "Transparent",
    desc: "See every Swiggy tool call the agent makes in real time. No black boxes.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    icon: Users,
    title: "Tell us about your family",
    desc: "Size, dietary goals, allergies, budget. Takes 30 seconds.",
  },
  {
    step: "2",
    icon: Search,
    title: "Chat naturally",
    desc: '"Find me a healthy dinner for tonight" — that\'s all you need.',
  },
  {
    step: "3",
    icon: CheckCircle,
    title: "Review & order",
    desc: "The agent presents curated options, builds your cart, and places the order when you confirm.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Salad className="size-5 text-primary" />
            <span className="font-semibold text-foreground">MealPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Powered by Swiggy MCP
            </span>
            <Link href="/setup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 text-xs text-orange-700 font-medium mb-6">
            <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
            Built on Swiggy Builders Club MCP
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-5 leading-[1.15]">
            Healthy meals for your family,{" "}
            <span className="text-primary">ordered by AI</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Tell MealPilot what you need. An AI agent searches Swiggy, picks the
            healthiest options for your family, and places the order — all in one
            conversation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/setup">
              <Button size="lg" className="h-11 px-8 text-sm font-semibold rounded-xl">
                Set up my family profile
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-8 text-sm rounded-xl"
              >
                Try the chat
              </Button>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-muted/40 border-y border-border/50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-semibold text-center mb-10">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="flex flex-col items-start gap-3">
                  <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-center mb-10">Why MealPilot</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <f.icon className="size-5 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Swiggy MCP callout */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 text-center">
            <p className="text-xs font-medium text-orange-600 mb-2 uppercase tracking-wide">
              Technology
            </p>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Powered by 49 Swiggy MCP tools
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              MealPilot uses Claude AI to orchestrate Swiggy&apos;s Model Context Protocol
              servers — searching restaurants, managing carts, and tracking deliveries in
              real time.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["search_restaurants", "get_restaurant_menu", "update_food_cart", "place_food_order", "track_food_order"].map(
                (tool) => (
                  <span
                    key={tool}
                    className="bg-white border border-orange-100 text-orange-700 rounded-full px-3 py-1 text-xs font-mono"
                  >
                    {tool}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>MealPilot — Swiggy Builders Club project by Rajeev Krishna</span>
          <span>Built with Next.js · Claude · Swiggy MCP</span>
        </div>
      </footer>
    </div>
  );
}
