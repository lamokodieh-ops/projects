"use client";

import { useRouter } from "next/navigation";
import { DEPARTMENTS } from "@/lib/utils";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DirectorySearch({
  initial,
}: {
  initial: { q?: string; year?: string; dept?: string; location?: string };
}) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, val] of fd.entries()) {
      if (val) params.set(key, String(val));
    }
    router.push(`/directory?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 items-end border-b border-navy/[0.08] pb-8 mb-10"
    >
      <Input label="Search" name="q" defaultValue={initial.q} placeholder="Name or company" />
      <Input label="Year" name="year" type="number" defaultValue={initial.year} placeholder="2014" />
      <Select label="Department" name="dept" defaultValue={initial.dept ?? ""}>
        <option value="">All</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>
      <Input label="Location" name="location" defaultValue={initial.location} placeholder="Accra" />
      <Button type="submit">Search</Button>
    </form>
  );
}
