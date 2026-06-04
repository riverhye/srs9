import { brand, social, type SiteKey } from "@/lib/site";

export function RootFooter({ site: _site }: { site: SiteKey }) {
  const year = new Date().getFullYear();
  const { github, email, linkedin } = social;

  const links = [
    github && { label: "GitHub", href: github, external: true },
    email && { label: "Email", href: `mailto:${email}`, external: false },
    linkedin && { label: "LinkedIn", href: linkedin, external: true },
  ].filter(Boolean) as { label: string; href: string; external: boolean }[];

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted">
          <span className="font-semibold text-foreground">
            srs<span className="text-accent">9</span>
          </span>
          <span className="mx-2 text-border">·</span>
          {brand.fullName}
        </p>

        {links.length > 0 && (
          <div className="flex items-center gap-5 text-muted">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="transition-colors hover:text-foreground"
                {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto max-w-3xl px-6 pb-8 text-xs text-muted">
        © {year} srs9
      </div>
    </footer>
  );
}
