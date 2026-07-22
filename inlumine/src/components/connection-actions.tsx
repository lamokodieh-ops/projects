"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConnectionActions({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function respond(action: "accept" | "decline") {
    setLoading(action);
    await fetch("/api/connections/respond", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId, action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => respond("accept")} disabled={!!loading}>
        {loading === "accept" ? "…" : "Accept"}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => respond("decline")} disabled={!!loading}>
        Decline
      </Button>
    </div>
  );
}
