"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/card";
import { DEPARTMENTS } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "COLLEGE_MATE",
    graduationYear: new Date().getFullYear() - 5,
    department: DEPARTMENTS[0],
    enrollmentYear: new Date().getFullYear(),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <PageTitle>Register</PageTitle>
          <p className="text-sm text-muted mb-10">Create your InLumine account.</p>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Input label="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              minLength={8}
              required
            />
            <Select label="Account type" value={form.role} onChange={(e) => update("role", e.target.value)}>
              <option value="COLLEGE_MATE">Alumni</option>
              <option value="STUDENT">Current student</option>
            </Select>
            {form.role === "COLLEGE_MATE" ? (
              <>
                <Input
                  label="Graduation year"
                  type="number"
                  min={1950}
                  max={new Date().getFullYear()}
                  value={form.graduationYear}
                  onChange={(e) => update("graduationYear", parseInt(e.target.value))}
                  required
                />
                <Select label="Department" value={form.department} onChange={(e) => update("department", e.target.value)}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </>
            ) : (
              <>
                <Select label="Department" value={form.department} onChange={(e) => update("department", e.target.value)}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
                <Input
                  label="Enrollment year"
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  value={form.enrollmentYear}
                  onChange={(e) => update("enrollmentYear", parseInt(e.target.value))}
                  required
                />
              </>
            )}
            {error && <p className="text-xs text-red">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-10 text-sm text-muted">
            Already registered?{" "}
            <Link href="/login" className="text-navy border-b border-gold/60 hover:border-navy transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
