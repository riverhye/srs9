import type { Metadata } from "next";
import { RootHeader } from "@/components/header/RootHeader";
import { RootFooter } from "@/components/footer/RootFooter";
import { sites } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: sites.me.title, template: "%s · srs9 me" },
  description: sites.me.description,
};

export default function MeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <RootHeader site="me" />
      <main className="flex-1">{children}</main>
      <RootFooter site="me" />
    </>
  );
}
