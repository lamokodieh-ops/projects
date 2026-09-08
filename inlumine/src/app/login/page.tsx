"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorTick, setErrorTick] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("That email or password doesn't match. Try again.");
        setErrorTick((n) => n + 1);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Sign in failed. Try again.");
      setErrorTick((n) => n + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <PageTitle>Sign in</PageTitle>
          <p className="text-sm text-muted mb-10">Welcome back.</p>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p key={errorTick} id="login-error" role="alert" className="text-xs text-red">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} aria-busy={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-xs text-muted">
            Demo account: <code className="text-navy">kwabena@example.com</code> /{" "}
            <code className="text-navy">Alumni123!</code>
          </p>
          <p className="mt-10 text-sm text-muted">
            No account?{" "}
            <Link href="/register" className="text-navy border-b border-gold/60 hover:border-navy transition-colors">
              Register
            </Link>
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
