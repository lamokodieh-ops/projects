"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UserActions({
  userId,
  role,
  status,
  isVerified,
}: {
  userId: string;
  role: string;
  status: string;
  isVerified?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(data: Record<string, string | boolean>) {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "ACTIVE" ? (
        <Button size="sm" variant="secondary" disabled={loading} onClick={() => update({ status: "SUSPENDED" })}>
          Suspend
        </Button>
      ) : (
        <Button size="sm" disabled={loading} onClick={() => update({ status: "ACTIVE" })}>
          Activate
        </Button>
      )}
      {role === "COLLEGE_MATE" && !isVerified && (
        <Button size="sm" disabled={loading} onClick={() => update({ verifyAlumni: true })}>
          Verify alumni
        </Button>
      )}
    </div>
  );
}
