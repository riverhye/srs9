import type { Metadata } from "next";

import { listEntries } from "@/lib/guestbook";
import { isOwner } from "@/lib/auth/session";
import { GuestbookBoard } from "@/components/guestbook/GuestbookBoard";

export const metadata: Metadata = { title: "Guestbook" };

export default async function GuestbookPage() {
  const [entries, owner] = await Promise.all([listEntries(), isOwner()]);

  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-bold tracking-tight">Guestbook</h1>
      <p className="mt-2 text-sm text-muted">한 줄 남겨주세요.</p>
      <GuestbookBoard initialEntries={entries} isOwner={owner} />
    </section>
  );
}
