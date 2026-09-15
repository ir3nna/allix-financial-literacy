"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home, Map, Target, Swords, Trophy, User, Sun, Moon, BookMarked,
  Users2, GraduationCap, ShieldCheck, ArrowLeft, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Thiing } from "@/components/thiing";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useGame } from "@/lib/game-state";
import { PORTALS_NAV, portalForPath } from "@/lib/portal-nav";

const PORTALS = [
  { href: "/parent", label: "За родители", icon: Users2 },
  { href: "/teacher", label: "За учители", icon: GraduationCap },
  { href: "/admin", label: "Админ", icon: ShieldCheck },
];

const ITEMS = [
  { href: "/", label: "Начало", icon: Home },
  { href: "/learn", label: "Уроци", icon: Map },
  { href: "/missions", label: "Мисии", icon: Target },
  { href: "/duel", label: "Дуел", icon: Swords },
  { href: "/glossary", label: "Речник", icon: BookMarked },
  { href: "/leaderboard", label: "Класация", icon: Trophy },
  { href: "/profile", label: "Профил", icon: User },
];

// Подстраници, които принадлежат на секция, но живеят на друг път —
// табът остава маркиран като „отворен". Напр. отворен урок → активно „Уроци".
const SECTION_ALIASES: Record<string, string[]> = {
  "/learn": ["/lesson"],
};

// Изскачащ надпис при свит сайдбар — показва името на страницата до иконката
function Tip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1.5 text-xs font-bold text-card opacity-0 shadow-lg transition-opacity duration-150 group-hover/nav:opacity-100"
    >
      {label}
    </span>
  );
}

export function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state, updateSettings, ready } = useGame();

  const portal = portalForPath(pathname);
  const activeTab = searchParams.get("tab") ?? portal?.tabs[0].key;
  // До зареждане на състоянието от localStorage сайдбарът е разгънат (както при SSR),
  // за да не се получи разминаване при хидратацията.
  const collapsed = ready ? state.sidebarCollapsed : false;

  // Ширината на сайдбара се чете и от <main> в layout.tsx
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", collapsed ? "4.5rem" : "16rem");
  }, [collapsed]);

  // Ефективна тема (при "system" следи предпочитанието на ОС)
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () =>
      setIsDark(state.theme === "dark" || (state.theme === "system" && mq.matches));
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [state.theme]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (pathname.startsWith(href)) return true;
    return (SECTION_ALIASES[href] ?? []).some((p) => pathname.startsWith(p));
  };

  const asideClass = cn(
    // Вертикалният падинг е еднакъв в двете състояния (py-4), за да НЕ мърдат табовете
    // нагоре/надолу при свиване; сменя се само хоризонталният.
    "fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-w)] flex-col border-r border-line bg-card py-4 transition-[width,padding] duration-300 ease-out md:flex",
    collapsed ? "px-2" : "px-4"
  );

  const sidebarHeader = (
    // Хедърът пази еднаква височина в двете състояния, за да не подскачат табовете
    <div className="mb-3">
      <div className={cn("flex h-[67px] items-center", collapsed ? "justify-center" : "pl-2")}>
        <Link href="/" className="block">
          {collapsed ? (
            <>
              {/* Свит знак: син в светла тема, бял в тъмна */}
              {/* eslint-disable @next/next/no-img-element */}
              <img src="/allix-mark.png" alt="Allix" className="h-10 w-auto dark:hidden" draggable={false} />
              <img src="/allix-mark-white.png" alt="Allix" className="hidden h-10 w-auto dark:block" draggable={false} />
              {/* eslint-enable @next/next/no-img-element */}
            </>
          ) : (
            <Logo />
          )}
        </Link>
      </div>
      {/* Разделител под логото — с ширината на целия хедър (до ръбовете на сайдбара) */}
      <div className={cn("border-b border-line", collapsed ? "-mx-2" : "-mx-4")} />
    </div>
  );

  // Бутон за свиване/разгъване — стои на десния ръб на сайдбара и излиза наполовина
  const collapseHandle = (
    <button
      onClick={() => updateSettings({ sidebarCollapsed: !collapsed })}
      aria-label={collapsed ? "Разгъни менюто" : "Свий менюто"}
      aria-expanded={!collapsed}
      className="absolute right-0 top-10 z-50 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-card text-allianz shadow-md transition-colors hover:bg-soft hover:text-allianz-dark"
    >
      {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
    </button>
  );

  const themeToggle = collapsed ? (
    <button
      onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
      aria-label={isDark ? "Светла тема" : "Тъмна тема"}
      className="group/nav relative mb-3 flex cursor-pointer items-center justify-center rounded-2xl bg-soft py-2.5 text-muted transition-colors hover:text-fg"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <Tip label={isDark ? "Светла тема" : "Тъмна тема"} />
    </button>
  ) : (
    <div className="mb-3 flex rounded-2xl bg-soft p-1" role="group" aria-label="Смяна на тема">
      <button
        onClick={() => updateSettings({ theme: "light" })}
        aria-pressed={!isDark}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
          !isDark ? "bg-card text-allianz shadow-sm" : "text-muted hover:text-fg"
        )}
      >
        <Sun size={15} /> Светла
      </button>
      <button
        onClick={() => updateSettings({ theme: "dark" })}
        aria-pressed={isDark}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
          isDark ? "bg-card text-allianz shadow-sm" : "text-muted hover:text-fg"
        )}
      >
        <Moon size={15} /> Тъмна
      </button>
    </div>
  );

  const portalLinks = (
    <div className="mt-auto mb-3">
      {/* Разделител над секция „Портали" */}
      <div className={cn("mb-3 border-t border-line", collapsed ? "-mx-2" : "-mx-4")} />
      {!collapsed && (
        <div className="px-4 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-muted/70">
          Портали
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {PORTALS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "group/nav relative flex items-center rounded-xl text-sm font-bold transition-colors",
              collapsed ? "justify-center py-2.5" : "gap-2.5 px-4 py-2.5",
              isActive(href) ? "bg-allianz/10 text-allianz" : "text-muted hover:bg-soft hover:text-fg"
            )}
          >
            <Icon size={18} className="text-allianz" />
            {collapsed ? <Tip label={label} /> : label}
          </Link>
        ))}
      </div>
    </div>
  );

  // ─── Сайдбар в портал: собствени табове ───
  if (portal) {
    return (
      <aside className={asideClass}>
        {collapseHandle}
        {sidebarHeader}

        {!collapsed && (
          <div className="mb-2 px-2 text-[11px] font-extrabold uppercase tracking-wider text-muted/70">
            {portal.title}
          </div>
        )}
        <nav className="flex flex-col gap-3">
          {portal.tabs.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <Link
                key={key}
                href={`${portal.base}?tab=${key}`}
                className={cn(
                  "group/nav relative flex items-center rounded-2xl text-[13px] font-bold transition-all",
                  collapsed ? "justify-center py-2.5" : "gap-3 px-4 py-2.5",
                  active
                    ? "bg-allianz text-white shadow-lg shadow-allianz/30"
                    : "text-fg hover:bg-soft"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? "text-blue-200" : "text-allianz/60"} />
                {collapsed ? <Tip label={label} /> : label}
              </Link>
            );
          })}
        </nav>

        {/* Превключване между порталите */}
        {portalLinks}

        {themeToggle}

        <Link
          href="/"
          className={cn(
            "group/nav relative flex items-center justify-center rounded-2xl bg-soft/70 py-2.5 text-xs font-bold text-muted transition-colors hover:text-fg",
            !collapsed && "gap-2"
          )}
        >
          <ArrowLeft size={14} />
          {collapsed ? <Tip label="Към приложението" /> : "Към приложението"}
        </Link>
      </aside>
    );
  }

  // ─── Ученически сайдбар ───
  return (
    <>
      {/* Странична лента — десктоп (Duolingo-стил: едри бутони с рамка на активния) */}
      <aside className={asideClass}>
        {collapseHandle}
        {sidebarHeader}
        <nav className="flex flex-col gap-3">
          {ITEMS.filter((i) => i.href !== "/profile").map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group/nav relative flex items-center rounded-2xl text-base font-bold transition-all",
                  collapsed ? "justify-center py-3" : "gap-3 px-4 py-3",
                  active
                    ? "bg-allianz text-white shadow-lg shadow-allianz/30"
                    : "text-fg hover:bg-soft"
                )}
              >
                <Icon size={23} strokeWidth={active ? 2.5 : 2} className={active ? "text-blue-200" : "text-allianz/60"} />
                {collapsed ? <Tip label={label} /> : label}
              </Link>
            );
          })}
        </nav>

        {/* Портали за родители, учители и администратори */}
        {portalLinks}

        {themeToggle}
      </aside>

      {/* Долна лента — мобилни (Профил е аватарът в горната лента) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-card/95 backdrop-blur md:hidden">
        {ITEMS.filter((i) => i.href !== "/profile").map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold",
              isActive(href) ? "text-allianz" : "text-muted"
            )}
          >
            <Icon size={22} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

// Marker: PORTALS_NAV re-exported for reference by consumers if needed
export { PORTALS_NAV };
