import type { Metadata } from "next";
import { RootHeader } from "@/components/header/RootHeader";
import { RootFooter } from "@/components/footer/RootFooter";
import { sites } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: sites.dev.title, template: "%s · srs9 dev" },
  description: sites.dev.description,
};

export default function DevLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <RootHeader site="dev" />
      <main className="flex-1">{children}</main>
      <RootFooter site="dev" />
    </>
  );
}
