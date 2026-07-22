"use client";

import { useRouter } from "next/navigation";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();

  async function markRead() {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={markRead}
      className="text-xs font-mono text-gold-dark hover:text-gold shrink-0"
    >
      Mark read
    </button>
  );
}
