"use client";

// Административен портал: добавяне на уроци, въпроси, игри, речник, видеа, значки и мисии.
// Демо: новите елементи се пазят като чернови в localStorage; в продукция — Supabase
// таблици lessons/questions/games/glossary/videos/badges/missions + роля "admin".

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Plus, Trash2, Database, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Thiing } from "@/components/thiing";
import { PortalTabs } from "@/components/portal-tabs";
import { LESSONS, WORLDS, BADGES, MISSIONS, AI_OPPONENTS, PRACTICAL_MISSIONS } from "@/lib/data";
import { GLOSSARY } from "@/lib/glossary";
import { cn } from "@/lib/utils";

type Field = { key: string; label: string; placeholder: string; type?: "text" | "select" | "number"; options?: string[] };

type SectionDef = {
  key: string;
  label: string;
  icon: string;
  builtinCount: number;
  builtinLabel: string;
  fields: Field[];
  titleField: string;
};

const QUESTION_COUNT = LESSONS.reduce((s, l) => s + l.quiz.length, 0);

const SECTIONS: SectionDef[] = [
  {
    key: "lessons",
    label: "Уроци",
    icon: "coin",
    builtinCount: LESSONS.length,
    builtinLabel: "публикувани урока в 8 свята",
    titleField: "title",
    fields: [
      { key: "title", label: "Заглавие", placeholder: "напр. Данъци за начинаещи" },
      { key: "world", label: "Свят", placeholder: "", type: "select", options: WORLDS.map((w) => `Свят ${w.id}: ${w.name}`) },
      { key: "xp", label: "XP награда", placeholder: "50", type: "number" },
    ],
  },
  {
    key: "questions",
    label: "Въпроси",
    icon: "target",
    builtinCount: QUESTION_COUNT + 10,
    builtinLabel: "въпроса в куизове и дневни предизвикателства",
    titleField: "question",
    fields: [
      { key: "question", label: "Въпрос", placeholder: "напр. Какво е депозит?" },
      { key: "correct", label: "Верен отговор", placeholder: "напр. Пари в банка срещу лихва" },
      { key: "wrong", label: "Грешни отговори (с запетая)", placeholder: "Заем, Данък, Такса" },
    ],
  },
  {
    key: "games",
    label: "Игри",
    icon: "chart",
    builtinCount: 4 + AI_OPPONENTS.length,
    builtinLabel: "игри: дуели (3 бота), 3 практически мисии, куизове",
    titleField: "name",
    fields: [
      { key: "name", label: "Име на играта", placeholder: "напр. Инвестиционен симулатор" },
      { key: "type", label: "Тип", placeholder: "", type: "select", options: ["Симулация", "Куиз битка", "Ролева игра", "Пъзел"] },
      { key: "xp", label: "XP награда", placeholder: "150", type: "number" },
    ],
  },
  {
    key: "glossary",
    label: "Речник",
    icon: "magnifying-glass",
    builtinCount: GLOSSARY.length,
    builtinLabel: "термина с обяснения и примери",
    titleField: "term",
    fields: [
      { key: "term", label: "Термин", placeholder: "напр. Дивидент" },
      { key: "definition", label: "Обяснение", placeholder: "Просто, на ученически език" },
      { key: "example", label: "Пример", placeholder: "От реалния живот" },
    ],
  },
  {
    key: "videos",
    label: "Видеа",
    icon: "sunset",
    builtinCount: 0,
    builtinLabel: "видеа (нов тип съдържание)",
    titleField: "title",
    fields: [
      { key: "title", label: "Заглавие", placeholder: "напр. Как работи банкоматът (2 мин)" },
      { key: "url", label: "Видео URL", placeholder: "https://…" },
      { key: "duration", label: "Продължителност", placeholder: "2:30" },
    ],
  },
  {
    key: "badges",
    label: "Значки",
    icon: "trophy",
    builtinCount: BADGES.length,
    builtinLabel: "значки в 7 категории",
    titleField: "name",
    fields: [
      { key: "name", label: "Име", placeholder: "напр. Данъчен детектив" },
      { key: "category", label: "Категория", placeholder: "", type: "select", options: ["Спестяване", "Банкиране", "Инвестиции", "Застраховки", "Безопасност", "Постоянство", "Дуели"] },
      { key: "condition", label: "Условие за печелене", placeholder: "напр. Завърши урока за данъци" },
    ],
  },
  {
    key: "missions",
    label: "Мисии",
    icon: "map",
    builtinCount: MISSIONS.length + 3,
    builtinLabel: "мисии: автоматични + 3 практически",
    titleField: "title",
    fields: [
      { key: "title", label: "Заглавие", placeholder: "напр. Сравни 3 телефонни плана" },
      { key: "type", label: "Тип", placeholder: "", type: "select", options: ["Дневна", "Седмична", "Практическа", "Специална"] },
      { key: "xp", label: "XP награда", placeholder: "100", type: "number" },
    ],
  },
];

// Публикуваното съдържание за всяка секция — само за преглед (редакцията минава през Supabase)
const MISSION_TYPE_LABELS: Record<string, string> = { daily: "Дневна", weekly: "Седмична", special: "Специална" };

type BuiltinItem = { icon: string; title: string; sub: string };

const BUILTIN_ITEMS: Record<string, BuiltinItem[]> = {
  lessons: LESSONS.map((l) => ({
    icon: l.icon,
    title: l.title,
    sub: `${WORLDS.find((w) => w.id === l.worldId)?.name} · ${l.duration} · ${l.xpReward} XP`,
  })),
  questions: LESSONS.flatMap((l) =>
    l.quiz.map((q) => ({ icon: l.icon, title: q.question, sub: `Урок: ${l.title}` }))
  ),
  games: [
    ...AI_OPPONENTS.map((a) => ({
      icon: a.avatar,
      title: `Дуел срещу ${a.name}`,
      sub: `${a.difficultyLabel} · победа ${a.winXp} XP`,
    })),
    ...PRACTICAL_MISSIONS.map((m) => ({ icon: m.icon, title: m.title, sub: `Практическа · ${m.xpReward} XP` })),
  ],
  glossary: GLOSSARY.map((t) => ({ icon: "magnifying-glass", title: t.term, sub: t.category })),
  videos: [],
  badges: BADGES.map((b) => ({ icon: b.icon, title: b.name, sub: `${b.category} · ${b.description}` })),
  missions: [
    ...MISSIONS.map((m) => ({
      icon: "target",
      title: m.title,
      sub: `${MISSION_TYPE_LABELS[m.type]} · ${m.xpReward} XP · ${m.description}`,
    })),
    ...PRACTICAL_MISSIONS.map((m) => ({ icon: m.icon, title: m.title, sub: `Практическа · ${m.xpReward} XP` })),
  ],
};

type Drafts = Record<string, Record<string, string>[]>;
const STORAGE_KEY = "allianz-academy-admin-drafts";

function AdminPortalInner() {
  const params = useSearchParams();
  const tabKey = params.get("tab") ?? SECTIONS[0].key;
  const section = SECTIONS.find((s) => s.key === tabKey) ?? SECTIONS[0];

  const [drafts, setDrafts] = useState<Drafts>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [browse, setBrowse] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDrafts(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  // Изчисти формата и търсенето при смяна на секция (таб)
  useEffect(() => { setForm({}); setBrowse(""); }, [section.key]);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts, ready]);

  if (!ready) return null;

  const sectionDrafts = drafts[section.key] ?? [];
  const formComplete = section.fields.every((f) => (form[f.key] ?? (f.type === "select" ? f.options?.[0] : "")).toString().trim());

  const addDraft = () => {
    const item: Record<string, string> = {};
    for (const f of section.fields) {
      item[f.key] = (form[f.key] ?? (f.type === "select" ? f.options![0] : "")).toString().trim();
    }
    setDrafts((d) => ({ ...d, [section.key]: [...(d[section.key] ?? []), item] }));
    setForm({});
  };

  const removeDraft = (idx: number) =>
    setDrafts((d) => ({ ...d, [section.key]: (d[section.key] ?? []).filter((_, i) => i !== idx) }));

  const totalDrafts = Object.values(drafts).reduce((s, arr) => s + arr.length, 0);
  const q = browse.trim().toLowerCase();
  const builtinList = (BUILTIN_ITEMS[section.key] ?? []).filter(
    (item) => !q || item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-allianz">
            <ShieldCheck size={14} /> Административен портал
          </div>
          <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">Управление на съдържанието</h1>
          <p className="text-sm font-medium text-muted">
            Демо: новите елементи се пазят като чернови локално; публикуването минава през Supabase
          </p>
        </div>
      </div>

      <PortalTabs base="/admin" />

      {/* Обзор на съдържанието: всички секции с брой елементи, кликаеми */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={`/admin?tab=${s.key}`}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 text-center transition-all",
              s.key === section.key
                ? "border-allianz bg-allianz/5"
                : "border-line bg-card hover:border-allianz/40"
            )}
          >
            <Thiing name={s.icon} size={32} />
            <span className="text-lg font-extrabold leading-none tabular-nums">
              {s.builtinCount + (drafts[s.key]?.length ?? 0)}
            </span>
            <span className="text-[11px] font-bold text-muted">{s.label}</span>
          </Link>
        ))}
        <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-line px-3 py-3 text-center">
          <Thiing name="hourglass" size={32} />
          <span className="text-lg font-extrabold leading-none tabular-nums">{totalDrafts}</span>
          <span className="text-[11px] font-bold text-muted">Чернови</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Форма за добавяне */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={18} className="text-allianz" /> Добави в „{section.label}“
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label htmlFor={`f-${f.key}`} className="mb-1 block text-xs font-bold text-muted">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    id={`f-${f.key}`}
                    value={form[f.key] ?? f.options![0]}
                    onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border-2 border-line bg-soft/50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-allianz"
                  >
                    {f.options!.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    id={`f-${f.key}`}
                    type={f.type === "number" ? "number" : "text"}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border-2 border-line bg-soft/50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-allianz"
                  />
                )}
              </div>
            ))}
            <Button size="lg" disabled={!formComplete} onClick={addDraft}>
              <Plus size={16} /> Добави като чернова
            </Button>
          </CardContent>
        </Card>

        {/* Съдържание в секцията */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={18} className="text-allianz" /> Съдържание
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-3 rounded-xl bg-soft/60 px-4 py-3">
              <Thiing name={section.icon} size={36} />
              <div>
                <div className="text-lg font-extrabold tabular-nums">{section.builtinCount}</div>
                <div className="text-xs font-semibold text-muted">{section.builtinLabel}</div>
              </div>
            </div>

            {/* Преглед на публикуваното съдържание */}
            {(BUILTIN_ITEMS[section.key] ?? []).length > 0 && (
              <>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    value={browse}
                    onChange={(e) => setBrowse(e.target.value)}
                    placeholder={`Търси в „${section.label}“…`}
                    className="w-full rounded-xl border-2 border-line bg-soft/50 py-2 pl-9 pr-3 text-sm font-semibold outline-none transition-colors focus:border-allianz"
                  />
                </div>
                <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
                  {builtinList.length === 0 ? (
                    <p className="rounded-xl bg-soft/60 p-3 text-center text-xs font-medium text-muted">
                      Нищо не съвпада с „{browse}“.
                    </p>
                  ) : (
                    builtinList.map((item, i) => (
                      <div key={`${item.title}-${i}`} className="flex items-center gap-2.5 rounded-xl bg-soft/40 px-3 py-2">
                        <Thiing name={item.icon} size={26} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-bold">{item.title}</div>
                          <div className="truncate text-[11px] font-medium text-muted">{item.sub}</div>
                        </div>
                        <Badge tone="green" className="shrink-0">Активно</Badge>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            <div className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-muted/70">
              Чернови ({sectionDrafts.length})
            </div>
            {sectionDrafts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm font-medium text-muted">
                Няма чернови — добавете първата от формата вляво.
              </p>
            ) : (
              sectionDrafts.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-line/60 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{item[section.titleField]}</div>
                    <div className="truncate text-xs font-medium text-muted">
                      {section.fields
                        .filter((f) => f.key !== section.titleField)
                        .map((f) => item[f.key])
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <Badge tone="orange">Чернова</Badge>
                  <button
                    aria-label="Изтрий черновата"
                    onClick={() => removeDraft(i)}
                    className="rounded-full p-2 text-muted transition-colors cursor-pointer hover:text-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  return (
    <Suspense fallback={null}>
      <AdminPortalInner />
    </Suspense>
  );
}
