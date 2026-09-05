"use client";

import { cn } from "@/lib/utils";
import { ToolCallsRow } from "./tool-call-badge";
import { Salad } from "lucide-react";

interface ToolCall {
  tool: string;
  summary: string;
}

interface ChatMessageProps {
  role: "user" | "assistant" | "loading";
  content?: string;
  toolCalls?: ToolCall[];
}

// Very simple markdown renderer for the subset we care about
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-sm mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-semibold text-sm mb-1">$1</h2>')
    .replace(/^• (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-0.5 my-1">$&</ul>')
    .replace(/₹(\d+)/g, '<span class="font-semibold text-green-700">₹$1</span>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br/>");
}

export function ChatMessage({ role, content, toolCalls = [] }: ChatMessageProps) {
  if (role === "loading") {
    return (
      <div className="flex gap-3 items-start">
        <div className="size-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
          <Salad className="size-3.5" />
        </div>
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <div className="flex gap-1 items-center h-4">
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (role === "user") {
    return (
      <div className="flex gap-3 items-start justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm">
          {content}
        </div>
        <div className="size-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0 text-secondary-foreground">
          You
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="size-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5">
        <Salad className="size-3.5" />
      </div>
      <div className="flex flex-col gap-1.5 max-w-[85%]">
        {toolCalls.length > 0 && <ToolCallsRow toolCalls={toolCalls} />}
        <div
          className={cn(
            "bg-muted rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-foreground leading-relaxed"
          )}
          dangerouslySetInnerHTML={{
            __html: `<p class="mb-2">${renderMarkdown(content ?? "")}</p>`,
          }}
        />
      </div>
    </div>
  );
}
