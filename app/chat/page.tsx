"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat-message";
import { loadProfile, DEFAULT_PROFILE, type FamilyProfile } from "@/lib/family-profile";
import { cn } from "@/lib/utils";
import { Salad, Users, Wallet, Send, ChevronDown } from "lucide-react";

type Backend = "demo" | "ollama" | "openrouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: { tool: string; summary: string }[];
}

const SUGGESTED_PROMPTS = [
  "Find me a healthy vegetarian dinner for tonight",
  "I need a high-protein meal for 4 people under ₹600",
  "What healthy options are available right now?",
  "Show me light lunches for my family",
];

const BACKEND_OPTIONS: { value: Backend; label: string; description: string }[] = [
  { value: "demo",       label: "Demo mode",   description: "Mock AI, no API needed" },
  { value: "ollama",     label: "Ollama",       description: "Local model at localhost:11434" },
  { value: "openrouter", label: "OpenRouter",   description: "Cloud AI (needs credits)" },
];

export default function ChatPage() {
  const [profile, setProfile] = useState<FamilyProfile>(DEFAULT_PROFILE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backend, setBackend] = useState<Backend>("demo");
  const [showBackendMenu, setShowBackendMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadProfile();
    if (saved) setProfile(saved);
    // Read default backend from a server hint if available
    const storedBackend = localStorage.getItem("mealpilot_backend") as Backend | null;
    if (storedBackend) setBackend(storedBackend);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Close backend dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowBackendMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectBackend(b: Backend) {
    setBackend(b);
    localStorage.setItem("mealpilot_backend", b);
    setShowBackendMenu(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          familyProfile: profile,
          backend,
        }),
      });

      const data = await res.json() as {
        message: string;
        toolCalls: { tool: string; summary: string }[];
        error?: string;
      };

      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          toolCalls: data.toolCalls ?? [],
        },
      ]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${errMsg}\n\nTry switching to **Demo mode** from the backend selector in the header.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isFirstMessage = messages.length === 0;
  const currentBackend = BACKEND_OPTIONS.find((b) => b.value === backend)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Salad className="size-5 text-primary" />
            <span className="font-semibold text-foreground">MealPilot</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Family badge */}
            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-full px-3 py-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              <span>{profile.members} people</span>
              <span>·</span>
              <Wallet className="size-3" />
              <span>₹{profile.budgetINR}</span>
            </div>

            {/* Backend toggle */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowBackendMenu((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all",
                  backend === "demo"       && "bg-amber-50 border-amber-200 text-amber-700",
                  backend === "ollama"     && "bg-violet-50 border-violet-200 text-violet-700",
                  backend === "openrouter" && "bg-blue-50 border-blue-200 text-blue-700"
                )}
              >
                <span className={cn(
                  "size-1.5 rounded-full",
                  backend === "demo"       && "bg-amber-500",
                  backend === "ollama"     && "bg-violet-500",
                  backend === "openrouter" && "bg-blue-500"
                )} />
                {currentBackend.label}
                <ChevronDown className="size-3" />
              </button>

              {showBackendMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-md overflow-hidden z-20">
                  {BACKEND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => selectBackend(opt.value)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 hover:bg-muted transition-colors",
                        backend === opt.value && "bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "size-1.5 rounded-full shrink-0",
                          opt.value === "demo"       && "bg-amber-500",
                          opt.value === "ollama"     && "bg-violet-500",
                          opt.value === "openrouter" && "bg-blue-500"
                        )} />
                        <div>
                          <p className="text-xs font-medium text-foreground">{opt.label}</p>
                          <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/setup">
              <Button variant="ghost" size="sm" className="text-xs">
                Edit profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {isFirstMessage ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Salad className="size-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Hi! I&apos;m MealPilot
            </h2>
            <p className="text-muted-foreground text-sm mb-1 max-w-sm">
              Tell me what healthy meal you need and I&apos;ll search Swiggy, build your
              cart, and help you order — all in one conversation.
            </p>
            <p className="text-[11px] text-muted-foreground mb-8">
              Running in{" "}
              <span className={cn(
                "font-medium",
                backend === "demo"       && "text-amber-600",
                backend === "ollama"     && "text-violet-600",
                backend === "openrouter" && "text-blue-600"
              )}>
                {currentBackend.label}
              </span>
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role}
                content={m.content}
                toolCalls={m.toolCalls}
              />
            ))}
            {isLoading && <ChatMessage role="loading" />}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="border-t border-border/50 bg-background sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {!isFirstMessage && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
              {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className={cn(
                    "shrink-0 text-xs px-3 py-1.5 rounded-full border border-border",
                    "hover:border-primary/50 hover:bg-muted/50 transition-all text-muted-foreground whitespace-nowrap"
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Find healthy dinner for my family tonight…"
              disabled={isLoading}
              className={cn(
                "flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-background",
                "outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="size-10 rounded-xl shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Swiggy MCP · Mock mode · {currentBackend.label}
          </p>
        </div>
      </div>
    </div>
  );
}
