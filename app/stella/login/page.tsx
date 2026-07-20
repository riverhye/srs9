"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StellaLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "로그인 실패");
      return;
    }
    router.push("/stella");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-sm px-6 pt-32 pb-16">
      <h1 className="text-2xl font-semibold">stella</h1>
      <form onSubmit={submit} className="mt-8">
        <input
          type="password"
          aria-label="code"
          placeholder="code"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-3 w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          In
        </button>
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </form>
    </section>
  );
}
