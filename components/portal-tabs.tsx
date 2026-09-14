"use client";

// Хоризонтални табове на порталите за мобилни екрани (на десктоп са в сайдбара)

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { portalForPath } from "@/lib/portal-nav";
import { cn } from "@/lib/utils";

export function PortalTabs({ base }: { base: string }) {
  const portal = portalForPath(base);
  const params = useSearchParams();
  if (!portal) return null;
  const active = params.get("tab") ?? portal.tabs[0].key;

  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl bg-soft p-1 md:hidden">
      {portal.tabs.map(({ key, label, icon: Icon }) => (
        <Link
          key={key}
          href={`${portal.base}?tab=${key}`}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all",
            active === key ? "bg-card text-allianz shadow-sm" : "text-muted"
          )}
        >
          <Icon size={14} />
          {label}
        </Link>
      ))}
    </div>
  );
}
