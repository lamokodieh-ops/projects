"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SocialComposer() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setContent("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-12 pb-8 border-b border-navy/[0.08]">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something…"
        className="max-w-none"
      />
      <Button type="submit" disabled={loading || !content.trim()} className="mt-6">
        {loading ? "Posting…" : "Post"}
      </Button>
    </form>
  );
}
