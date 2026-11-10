"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

/** Vertical on wide screens, a scrolling strip on phones. */
export function SideNav({ items, label }: { items: Item[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1 md:flex-col">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block whitespace-nowrap rounded-full px-4 py-2.5 font-medium transition-colors md:rounded-xl",
                  active ? "bg-pine-600 text-white" : "hover:bg-pine-50",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const userItems: Item[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/reservations", label: "My reservations" },
  { href: "/appointments", label: "Find a time" },
  { href: "/account", label: "Account" },
];

export function Sidebar() {
  return <SideNav items={userItems} label="Your account" />;
}
