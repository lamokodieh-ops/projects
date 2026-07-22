"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ConnectButton({
  recipientId,
  initialStatus,
}: {
  recipientId: string;
  initialStatus: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function connect() {
    setLoading(true);
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId }),
    });
    setLoading(false);
    if (res.ok) {
      setStatus("PENDING");
      router.refresh();
    }
  }

  if (status === "ACCEPTED") {
    return <span className="text-sm text-muted">Connected</span>;
  }
  if (status === "PENDING") {
    return <span className="text-sm text-navy/60">Request pending</span>;
  }

  return (
    <Button onClick={connect} disabled={loading}>
      {loading ? "Sending…" : "Connect"}
    </Button>
  );
}
