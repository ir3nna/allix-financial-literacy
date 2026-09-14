"use client";

// Горна лента: на десктоп — търсачка вляво, пилчета (IQ/XP/серия) и профил вдясно.
// На мобилно — лого на платформата вляво и аватар (→ профил) вдясно.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, Flame } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { Thiing } from "@/components/thiing";
import { Logo } from "@/components/logo";
import { useGame } from "@/lib/game-state";
import { iqFromState, iqTitle } from "@/lib/iq";

export function Header() {
  const pathname = usePathname();
  const { state, level, ready } = useGame();
  // Порталите за възрастни имат собствени заглавия — ученическата лента се скрива
  if (["/parent", "/teacher", "/admin"].some((p) => pathname.startsWith(p))) return null;
  if (!ready) return null;

  const iq = iqFromState(state);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1700px] items-center gap-3 px-4 py-5 md:px-8">
        {/* Мобилно: лого на платформата */}
        <Link href="/" className="md:hidden">
          <Logo size="sm" />
        </Link>

        {/* Десктоп: търсачка в уроци и речник */}
        <SearchBar className="hidden w-full max-w-md md:block" />

        {/* Десктоп: пилчета Финансов IQ · XP · серия + профил */}
        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          <span
            title={`Финансов IQ: ${iq} / 1000 · ${iqTitle(iq)}`}
            className="flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-xs font-extrabold tabular-nums"
          >
            <Thiing name="brain" size={16} /> {iq}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-allianz/10 px-3 py-1.5 text-xs font-extrabold text-allianz tabular-nums">
            <Star size={13} fill="currentColor" /> {state.xp} XP
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-extrabold text-amber-700 tabular-nums dark:text-amber-400">
            <Flame size={13} className="text-orange-500" fill="currentColor" /> {state.streak} дни
          </span>
          {/* Профил: аватар, име и ниво */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full bg-soft py-1 pl-1 pr-3.5 transition-colors hover:bg-allianz/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card p-0.5 ring-2 ring-allianz/25">
              <Thiing name={state.avatar} size={26} />
            </span>
            <span className="text-sm font-extrabold leading-tight">
              {state.name}
              <span className="block text-[11px] font-bold text-allianz">Ниво {level}</span>
            </span>
          </Link>
        </div>

        {/* Мобилно: аватар (→ профил) */}
        <Link
          href="/profile"
          aria-label="Профил"
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft p-1 ring-2 ring-allianz/20 md:hidden"
        >
          <Thiing name={state.avatar} size={34} />
        </Link>
      </div>
    </header>
  );
}
