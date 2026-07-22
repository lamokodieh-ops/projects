"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/card";
import { DEPARTMENTS } from "@/lib/utils";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "JOB",
    title: "",
    description: "",
    company: "",
    location: "",
    department: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to post.");
      return;
    }

    router.push(`/opportunities/${data.id}`);
  }

  return (
    <div className="max-w-md">
      <PageTitle>Post opportunity</PageTitle>
      <form onSubmit={handleSubmit} className="space-y-8 mt-10">
        <Select label="Type" value={form.type} onChange={(e) => update("type", e.target.value)}>
          <option value="JOB">Job</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="MENTORSHIP">Mentorship</option>
          <option value="EVENT">Event</option>
        </Select>
        <Input label="Title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        <Textarea label="Description" value={form.description} onChange={(e) => update("description", e.target.value)} required />
        <Input label="Company" value={form.company} onChange={(e) => update("company", e.target.value)} />
        <Input label="Location" value={form.location} onChange={(e) => update("location", e.target.value)} />
        <Select label="Department" value={form.department} onChange={(e) => update("department", e.target.value)}>
          <option value="">All</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
        {error && <p className="text-xs text-red">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Posting…" : "Post"}
        </Button>
      </form>
    </div>
  );
}
