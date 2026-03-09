"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/apply", label: "Apply" },
  { href: "/studio", label: "Studio" },
  { href: "/projects/pulseboard-season-zero", label: "Launch Room" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="siteShell">
      <header className="siteHeader">
        <div className="masthead">
          <Link className="brandMark" href="/">
            <span className="brandBadge">LK</span>
            <span>
              <strong>LaunchKit</strong>
              <small>Bags-native launch studio</small>
            </span>
          </Link>

          <nav className="siteNav" aria-label="Primary">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  className={active ? "navPill isActive" : "navPill"}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="pageFrame">{children}</main>

      <footer className="siteFooter">
        <p>LaunchKit turns Bags launch planning into something builders can review, approve, and ship without vague promises.</p>
      </footer>
    </div>
  );
}
