"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function OpportunityModeration({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function moderate(action: "approve" | "close") {
    setLoading(true);
    await fetch(`/api/opportunities/${opportunityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 mb-10 py-4 border-y border-navy/[0.08]">
      <p className="text-sm text-muted flex-1">Pending review</p>
      <Button size="sm" onClick={() => moderate("approve")} disabled={loading}>Approve</Button>
      <Button size="sm" variant="secondary" onClick={() => moderate("close")} disabled={loading}>Close</Button>
    </div>
  );
}
