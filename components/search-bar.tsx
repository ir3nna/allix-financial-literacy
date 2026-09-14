"use client";

// Глобално търсене в уроци и речник — живее в горната лента.

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, BookMarked } from "lucide-react";
import { Thiing } from "@/components/thiing";
import { LESSONS, WORLDS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const lessonResults = q
    ? LESSONS.filter((l) => l.title.toLowerCase().includes(q)).slice(0, 5)
    : [];
  const termResults = q
    ? GLOSSARY.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)).slice(0, 3)
    : [];

  return (
    <div className={cn("relative", className)}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Търси урок или термин…"
        className="w-full rounded-full border-2 border-line bg-soft/50 py-2 pl-10 pr-4 text-sm font-semibold outline-none transition-colors focus:border-allianz focus:bg-card"
      />
      {q && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
          {lessonResults.length === 0 && termResults.length === 0 ? (
            <p className="p-4 text-sm font-medium text-muted">Нищо не открих — питай Фини!</p>
          ) : (
            <>
              {lessonResults.map((l) => {
                const w = WORLDS.find((x) => x.id === l.worldId)!;
                return (
                  <Link
                    key={l.id}
                    href={`/lesson/${l.id}`}
                    onClick={() => setQuery("")}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-soft/60"
                  >
                    <Thiing name={l.icon} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{l.title}</span>
                      <span className="text-[11px] font-semibold text-muted">Урок · {w.name} · {l.duration}</span>
                    </span>
                    <ArrowRight size={14} className="shrink-0 text-muted" />
                  </Link>
                );
              })}
              {termResults.map((t) => (
                <Link
                  key={t.term}
                  href="/glossary"
                  onClick={() => setQuery("")}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-soft/60"
                >
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-allianz/10 text-allianz">
                    <BookMarked size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{t.term}</span>
                    <span className="text-[11px] font-semibold text-muted">Речник · {t.category}</span>
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-muted" />
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
