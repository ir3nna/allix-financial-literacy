"use client";

// Речник: всички финансови термини с обяснение и пример,
// с търсене и филтър по категория. Хоризонтални карти — термин вляво,
// обяснение и пример вдясно, всичко видимо без разгъване.

import { useMemo, useState } from "react";
import { Search, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GLOSSARY, GLOSSARY_CATEGORIES } from "@/lib/glossary";
import { cn } from "@/lib/utils";

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter(
      (t) =>
        (!category || t.category === category) &&
        (!q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q))
    );
  }, [query, category]);

  // Групиране по категория в реда от GLOSSARY_CATEGORIES
  const grouped = GLOSSARY_CATEGORIES
    .map((cat) => ({ cat, terms: filtered.filter((t) => t.category === cat) }))
    .filter((g) => g.terms.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">Речник</h1>
        <p className="text-sm font-medium text-muted">
          {GLOSSARY.length} термина, обяснени на човешки език — с пример от живота
        </p>
      </div>

      {/* Търсене */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Търси термин… (напр. лихва, ГПР, фишинг)"
          className="w-full rounded-2xl border-2 border-line bg-card py-3 pl-11 pr-4 text-sm font-semibold outline-none transition-colors focus:border-allianz"
        />
      </div>

      {/* Категории */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer",
            category === null ? "bg-allianz text-white" : "bg-soft text-muted hover:text-fg"
          )}
        >
          Всички
        </button>
        {GLOSSARY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(category === cat ? null : cat)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer",
              category === cat ? "bg-allianz text-white" : "bg-soft text-muted hover:text-fg"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Термини по категории */}
      {grouped.length === 0 && (
        <Card>
          <CardContent className="pt-5 text-center text-sm font-medium text-muted">
            Няма намерени термини за „{query}“. Пробвай с друга дума — или питай Аликс!
          </CardContent>
        </Card>
      )}

      {/* По-голямо разстояние между категориите, особено в изглед „Всички“ */}
      <div className={cn("flex flex-col", category === null ? "gap-12" : "gap-8")}>
        {grouped.map(({ cat, terms }) => (
          <section key={cat} className="flex flex-col gap-2">
            <h2 className="flex items-center border-b border-line pb-1.5 text-sm font-bold uppercase tracking-wide text-muted">
              {cat}
              <span className="ml-auto rounded-full bg-soft px-2.5 py-0.5 text-[11px] font-extrabold normal-case tabular-nums">
                {terms.length} {terms.length === 1 ? "термин" : "термина"}
              </span>
            </h2>
            <div className="flex flex-col gap-2.5">
              {terms.map((t) => (
                <Card key={t.term}>
                  <CardContent className="flex flex-col gap-3 py-4 pt-4 md:flex-row md:items-start md:gap-6">
                    {/* Термин — лява колона */}
                    <div className="shrink-0 md:w-52">
                      <div className="text-base font-extrabold leading-snug">{t.term}</div>
                      <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-muted/70">
                        {t.category}
                      </div>
                    </div>
                    {/* Обяснение и пример — дясна колона */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-fg/90">{t.definition}</p>
                      <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-allianz/5 p-3">
                        <Quote size={14} className="mt-0.5 shrink-0 text-allianz" />
                        <p className="text-sm font-medium leading-relaxed text-fg/80">
                          <span className="font-bold text-allianz">Пример: </span>
                          {t.example}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
