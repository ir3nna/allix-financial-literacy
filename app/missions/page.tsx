"use client";

// Мисии: дневно предизвикателство (нов въпрос всеки ден), практически мисии
// (интерактивни реални задачи) и автоматично проследявани дневни/седмични мисии.

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, ChevronLeft, Zap, Plus, Trash2, Minus,
  ArrowRight, Sparkles, Target, CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thiing } from "@/components/thiing";
import { Mascot } from "@/components/mascot";
import { DoodleBg } from "@/components/doodle-bg";
import { FiniBubble } from "@/components/fini";
import { useGame } from "@/lib/game-state";
import {
  MISSIONS, PRACTICAL_MISSIONS, todaysDailyQuestion, type Mission,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const TYPE_META: Record<Mission["type"], { label: string; tone: "blue" | "green" | "orange" }> = {
  daily: { label: "Дневна", tone: "blue" },
  weekly: { label: "Седмична", tone: "green" },
  special: { label: "Специална", tone: "orange" },
};

type View = "list" | "daily" | "pm-expenses" | "pm-savings" | "pm-trip";

// ─────────────────────────── Обвивка на мисия ───────────────────────────
// Една голяма карта с рисуван doodle фон: ляв контекстен панел (илюстрация +
// заглавие) и дясна колона с интерактивното съдържание. Изпълва десктопа плътно.
function MissionShell({
  icon, color, kicker, title, subtitle, eyebrow, onBack, children,
}: {
  icon: string; color: string; kicker: string; title: string;
  subtitle: string; eyebrow: string; onBack: () => void; children: ReactNode;
}) {
  return (
    <div className="w-full">
      <Card className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${color} 9%, var(--card)) 0%, var(--card) 55%)` }}
        />
        <DoodleBg color={color} />

        <CardContent className="relative p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={onBack}
              aria-label="Назад към мисиите"
              className="rounded-full p-2 text-muted transition-colors cursor-pointer hover:bg-soft hover:text-fg"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted">{eyebrow}</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
            {/* Ляв контекст */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
              <div
                className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl shadow-md"
                style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, #0a1030))` }}
              >
                <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
                <Sparkles className="pointer-events-none absolute bottom-4 right-6 text-white/50 animate-float" size={24} />
                <span className="animate-float select-none drop-shadow-lg">
                  <Thiing name={icon} size={128} />
                </span>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted">{kicker}</div>
                <h1 className="mt-0.5 text-xl font-extrabold leading-tight">{title}</h1>
                <p className="mt-2 text-sm font-medium text-muted">{subtitle}</p>
              </div>
            </aside>

            {/* Дясна колона: интерактивно съдържание */}
            <div className="flex flex-col justify-center rounded-2xl border border-line/70 bg-card/85 p-6 shadow-sm backdrop-blur-sm sm:p-8 lg:min-h-[520px]">
              {children}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────── Дневно предизвикателство ───────────────────────────

function DailyChallenge({ onBack }: { onBack: () => void }) {
  const { answerDaily } = useGame();
  const q = todaysDailyQuestion();
  const [picked, setPicked] = useState<number | null>(null);

  const answer = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const correct = idx === q.correct;
    answerDaily(correct, correct ? q.bonusXp : 10);
  };

  return (
    <MissionShell
      icon="target"
      color="#0057ff"
      kicker="Дневно предизвикателство"
      title="Днешният въпрос"
      subtitle={`Верен отговор ти носи +${q.bonusXp} XP. Всеки ден нова тема и нов бонус!`}
      eyebrow="Мисии · Дневно предизвикателство"
      onBack={onBack}
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-allianz">
        <Zap size={14} /> +{q.bonusXp} XP при верен отговор
      </div>
      <h2 className="mt-2 text-xl font-bold">{q.question}</h2>
      <div className="mt-5 flex flex-col gap-3">
        {q.options.map((opt, i) => {
          const answered = picked !== null;
          const isCorrect = i === q.correct;
          const isPicked = picked === i;
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={answered}
              className={cn(
                "rounded-xl border-2 p-4 text-left text-sm font-semibold transition-all cursor-pointer disabled:cursor-default",
                !answered && "border-line hover:border-allianz/50",
                answered && isCorrect && "border-success bg-success/5",
                answered && isPicked && !isCorrect && "border-danger bg-danger/5",
                answered && !isPicked && !isCorrect && "border-line/60 opacity-50"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="mt-4 flex flex-col gap-3">
          <FiniBubble tone={picked === q.correct ? "success" : "warn"}>
            {picked === q.correct
              ? `Точен изстрел! +${q.bonusXp} XP в джоба. ${q.explanation}`
              : `Не се притеснявай. Нека опитаме по друг начин: ${q.explanation} Взимаш +10 XP за смелостта — утре нов въпрос!`}
          </FiniBubble>
          <Button size="lg" onClick={onBack}>Към мисиите</Button>
        </motion.div>
      )}
    </MissionShell>
  );
}

// ─────────────────────────── Мисия: семейните разходи ───────────────────────────

type ExpenseRow = { name: string; amount: string; cat: string };
const EXPENSE_CATS = ["Храна", "Транспорт", "Забавление", "Сметки", "Друго"];

function ExpensesMission({ onBack }: { onBack: () => void }) {
  const { completePractical } = useGame();
  const [rows, setRows] = useState<ExpenseRow[]>([
    { name: "", amount: "", cat: "Храна" },
  ]);
  const [finished, setFinished] = useState(false);

  const validRows = rows.filter((r) => r.name.trim() && Number(r.amount) > 0);
  const total = validRows.reduce((s, r) => s + Number(r.amount), 0);
  const byCat = EXPENSE_CATS.map((c) => ({
    cat: c,
    sum: validRows.filter((r) => r.cat === c).reduce((s, r) => s + Number(r.amount), 0),
  })).filter((c) => c.sum > 0);
  const biggest = [...byCat].sort((a, b) => b.sum - a.sum)[0];

  const update = (i: number, patch: Partial<ExpenseRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const finish = () => {
    completePractical("pm-expenses", 100);
    setFinished(true);
  };

  if (finished) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex justify-center"><Mascot pose="coin" size={120} className="drop-shadow-md" /></div>
          <h2 className="text-center text-xl font-extrabold">Дневникът е готов!</h2>
          <div className="rounded-xl bg-soft/60 p-4 text-sm font-semibold">
            <div className="flex justify-between"><span>Общо разходи за деня</span><span className="tabular-nums">{total.toFixed(2)} €</span></div>
            {byCat.map((c) => (
              <div key={c.cat} className="mt-1 flex justify-between text-muted">
                <span>{c.cat}</span><span className="tabular-nums">{c.sum.toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <FiniBubble tone="success">
            Браво, детектив на разходите! Най-много отива за „{biggest?.cat}“. Само това упражнение — да ВИДИШ къде отиват парите — е първата стъпка на всеки бюджет. +100 XP!
          </FiniBubble>
          <Button size="lg" onClick={onBack}>Към мисиите</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <MissionShell
      icon="wallet"
      color="#0d9488"
      kicker="Практическа мисия"
      title="Семейните разходи днес"
      subtitle="Питай вкъщи и запиши поне 5 разхода — от закуската до тока."
      eyebrow="Мисии · Практическа"
      onBack={onBack}
    >
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={row.name}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder={["Хляб и закуски", "Билети за транспорт", "Ток / вода", "Кино", "Лекарства"][i % 5]}
              className="min-w-0 flex-1 rounded-xl border-2 border-line bg-soft/50 px-3 py-2 text-sm font-semibold outline-none focus:border-allianz"
            />
            <input
              value={row.amount}
              onChange={(e) => update(i, { amount: e.target.value.replace(/[^0-9.]/g, "") })}
              placeholder="€"
              inputMode="decimal"
              className="w-20 rounded-xl border-2 border-line bg-soft/50 px-3 py-2 text-sm font-semibold outline-none focus:border-allianz tabular-nums"
            />
            <select
              value={row.cat}
              onChange={(e) => update(i, { cat: e.target.value })}
              className="rounded-xl border-2 border-line bg-soft/50 px-2 py-2 text-sm font-semibold outline-none focus:border-allianz"
            >
              {EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button
              aria-label="Премахни реда"
              onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
              disabled={rows.length === 1}
              className="rounded-full p-2 text-muted transition-colors cursor-pointer hover:text-danger disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, { name: "", amount: "", cat: "Храна" }])}>
          <Plus size={14} /> Добави разход
        </Button>
        <div className="text-sm font-bold tabular-nums">
          Общо: {total.toFixed(2)} €
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Progress value={(Math.min(validRows.length, 5) / 5) * 100} className="h-2 flex-1" />
        <span className="text-xs font-semibold text-muted tabular-nums">{Math.min(validRows.length, 5)} / 5 разхода</span>
      </div>

      <Button className="mt-5 w-full" size="lg" disabled={validRows.length < 5} onClick={finish}>
        Приключи деня <ArrowRight size={16} />
      </Button>
    </MissionShell>
  );
}

// ─────────────────────────── Мисия: три начина за спестяване ───────────────────────────

const SAVING_OPTIONS = [
  "Правилото за 24 часа преди покупка",
  "Сравнявай цени в поне 2 магазина",
  "Буркан за рестото всяка вечер",
  "Пазарувай със списък — и само по него",
  "Откажи един абонамент, който не ползваш",
  "Носи си вода и закуска от вкъщи",
  "Продай 3 неща, които не ползваш",
  "Заделяй 20% от джобните веднага",
];

function SavingsMission({ onBack }: { onBack: () => void }) {
  const { completePractical } = useGame();
  const [picked, setPicked] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const toggle = (opt: string) =>
    setPicked((p) => (p.includes(opt) ? p.filter((o) => o !== opt) : p.length < 3 ? [...p, opt] : p));

  const finish = () => {
    completePractical("pm-savings", 80);
    setFinished(true);
  };

  if (finished) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex justify-center"><Mascot pose="piggy" size={120} className="drop-shadow-md" /></div>
          <h2 className="text-center text-xl font-extrabold">Планът за спестяване е готов!</h2>
          <ul className="flex flex-col gap-2">
            {picked.map((p) => (
              <li key={p} className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2.5 text-sm font-bold text-green-800 dark:text-green-300">
                <CheckCircle2 size={16} className="shrink-0" /> {p}
              </li>
            ))}
          </ul>
          <FiniBubble tone="success">
            Отличен избор! Приложи ги този месец и брой колко лева остават — ще се изненадаш. Малките навици правят големите сметки. +80 XP!
          </FiniBubble>
          <Button size="lg" onClick={onBack}>Към мисиите</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <MissionShell
      icon="piggy-bank"
      color="#16a34a"
      kicker="Практическа мисия"
      title="Три начина за спестяване"
      subtitle="Избери 3 тактики, които реално ще пробваш този месец."
      eyebrow="Мисии · Практическа"
      onBack={onBack}
    >
      <div className="grid gap-2 md:grid-cols-2">
        {SAVING_OPTIONS.map((opt) => {
          const on = picked.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 p-3.5 text-left text-sm font-semibold transition-all cursor-pointer",
                on ? "border-allianz bg-allianz/10 text-allianz" : "border-line hover:border-allianz/40",
                !on && picked.length >= 3 && "opacity-40"
              )}
            >
              <span className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                on ? "border-allianz bg-allianz text-white" : "border-line"
              )}>
                {on && <CheckCircle2 size={14} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Progress value={(picked.length / 3) * 100} className="h-2 flex-1" />
        <span className="text-xs font-semibold text-muted tabular-nums">{picked.length} / 3</span>
      </div>

      <Button className="mt-5 w-full" size="lg" disabled={picked.length !== 3} onClick={finish}>
        Готово, избрах <ArrowRight size={16} />
      </Button>
    </MissionShell>
  );
}

// ─────────────────────────── Мисия: бюджет за екскурзията ───────────────────────────

const TRIP_BUDGET = 100;
const TRIP_CATS = [
  { key: "transport", label: "Транспорт", min: 5 },
  { key: "food", label: "Храна", min: 5 },
  { key: "tickets", label: "Входни билети", min: 5 },
  { key: "souvenirs", label: "Сувенири", min: 0 },
  { key: "reserve", label: "Резерв за изненади", min: 10 },
];

function TripMission({ onBack }: { onBack: () => void }) {
  const { completePractical } = useGame();
  const [alloc, setAlloc] = useState<Record<string, number>>({
    transport: 0, food: 0, tickets: 0, souvenirs: 0, reserve: 0,
  });
  const [finished, setFinished] = useState(false);

  const total = Object.values(alloc).reduce((a, b) => a + b, 0);
  const left = TRIP_BUDGET - total;
  const rulesOk = total <= TRIP_BUDGET && TRIP_CATS.every((c) => alloc[c.key] >= c.min);

  const bump = (key: string, delta: number) =>
    setAlloc((a) => {
      if (delta > 0 && total + delta > TRIP_BUDGET) return a; // не надхвърляй бюджета
      return { ...a, [key]: Math.max(0, a[key] + delta) };
    });

  const finish = () => {
    completePractical("pm-trip", 120);
    setFinished(true);
  };

  if (finished) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex justify-center"><Mascot pose="thumb" size={120} className="drop-shadow-md" /></div>
          <h2 className="text-center text-xl font-extrabold">Бюджетът за екскурзията е готов!</h2>
          <div className="rounded-xl bg-soft/60 p-4 text-sm font-semibold">
            {TRIP_CATS.map((c) => (
              <div key={c.key} className="flex justify-between py-0.5">
                <span>{c.label}</span><span className="tabular-nums">{alloc[c.key]} €</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-line pt-2">
              <span>Общо</span><span className="tabular-nums">{total} / {TRIP_BUDGET} €</span>
            </div>
          </div>
          <FiniBubble tone="success">
            {alloc.reserve >= 20
              ? `Резерв от цели ${alloc.reserve} € — мислиш като истински финансист! Изненадите не могат да те стреснат.`
              : "Планът е стабилен, а резервът ще те спаси, ако автобусът закъснее и огладнееш."}{" "}
            Покажи го на класния преди екскурзията. +120 XP!
          </FiniBubble>
          <Button size="lg" onClick={onBack}>Към мисиите</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <MissionShell
      icon="map"
      color="#7c3aed"
      kicker="Практическа мисия"
      title="Бюджет за училищната екскурзия"
      subtitle={`Имаш ${TRIP_BUDGET} €. Разпредели ги по пера — резервът е задължителен (мин. 10 €).`}
      eyebrow="Мисии · Практическа"
      onBack={onBack}
    >
      <div className="flex flex-col gap-3">
        {TRIP_CATS.map((c) => (
            <div key={c.key} className="flex items-center gap-3 rounded-xl border border-line/60 bg-soft/40 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{c.label}</div>
                <div className="text-xs font-semibold text-muted">мин. {c.min} €</div>
              </div>
              <button
                aria-label={`Намали ${c.label}`}
                onClick={() => bump(c.key, -5)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-line transition-colors cursor-pointer hover:border-allianz"
              >
                <Minus size={16} />
              </button>
              <span
                className={cn(
                  "w-16 text-center text-lg font-extrabold tabular-nums",
                  alloc[c.key] < c.min ? "text-danger" : "text-fg"
                )}
              >
                {alloc[c.key]}
              </span>
              <button
                aria-label={`Увеличи ${c.label}`}
                onClick={() => bump(c.key, 5)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-line transition-colors cursor-pointer hover:border-allianz"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-bold text-muted tabular-nums">
            <span>Разпределени: {total} €</span>
            <span className={left < 0 ? "text-danger" : undefined}>Остават: {left} €</span>
          </div>
          <Progress value={(total / TRIP_BUDGET) * 100} className="h-2" barClassName={rulesOk ? "bg-success" : undefined} />
        </div>

      {!rulesOk && total > 0 && (
        <p className="mt-3 text-xs font-semibold text-muted">
          Правила: всяко перо покрива минимума си, резервът е поне 10 €, а общата сума — до {TRIP_BUDGET} €
        </p>
      )}

      <Button className="mt-5 w-full" size="lg" disabled={!rulesOk} onClick={finish}>
        Одобри бюджета <ArrowRight size={16} />
      </Button>
    </MissionShell>
  );
}

// ─────────────────────────── Списък с мисии ───────────────────────────

export default function MissionsPage() {
  const { state, ready } = useGame();
  const [view, setView] = useState<View>("list");

  if (!ready) return null;

  if (view === "daily") return <DailyChallenge onBack={() => setView("list")} />;
  if (view === "pm-expenses") return <ExpensesMission onBack={() => setView("list")} />;
  if (view === "pm-savings") return <SavingsMission onBack={() => setView("list")} />;
  if (view === "pm-trip") return <TripMission onBack={() => setView("list")} />;

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const entries = Object.entries(state.progress);
  const dailyDone = state.dailyChallenge?.date === today;
  const q = todaysDailyQuestion();

  const progressFor = (m: Mission) => {
    if (m.id === "m-special-1") return entries.some(([id]) => id === "w8-l1") ? 1 : 0;
    if (m.metric === "lessons" && m.type === "daily")
      return entries.filter(([, p]) => p.completedAt.slice(0, 10) === today).length;
    if (m.metric === "lessons") return entries.filter(([, p]) => p.completedAt >= weekAgo).length;
    if (m.metric === "perfect" && m.type === "daily")
      return entries.filter(([, p]) => p.perfect && p.completedAt.slice(0, 10) === today).length;
    return entries.filter(([, p]) => p.perfect && p.completedAt >= weekAgo).length;
  };

  // Седмично предизвикателство — водещата седмична мисия (напредък се проследява автоматично)
  const weekly = MISSIONS.find((m) => m.type === "weekly" && m.metric === "lessons") ?? MISSIONS.find((m) => m.type === "weekly");
  const weeklyDone = weekly ? Math.min(progressFor(weekly), weekly.target) : 0;
  const weeklyDoneComplete = weekly ? weeklyDone >= weekly.target : false;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
          <Target size={26} className="text-allianz" /> Мисии
        </h1>
        <p className="text-sm font-medium text-muted">Изпълнявай предизвикателства, трупай XP</p>
      </div>

      {/* Дневно + Седмично предизвикателство — две карти, всяка с маскота си вътре */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Дневно — с маскота стрелец вътре */}
        <button
          onClick={() => !dailyDone && setView("daily")}
          disabled={dailyDone}
          className={cn("text-left", !dailyDone && "cursor-pointer transition-transform hover:scale-[1.01]")}
        >
          <Card className={cn(
            "relative h-full overflow-hidden text-white",
            dailyDone
              ? "bg-gradient-to-br from-success to-green-700"
              : "border-allianz/30 bg-gradient-to-br from-allianz to-allianz-dark"
          )}>
            <CardContent className="relative pb-5 pr-40 pt-5 sm:pr-44 md:pr-56">
              <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/70">
                  <Zap size={14} /> Дневно предизвикателство
                </div>
                {dailyDone ? (
                  <>
                    <div className="mt-1.5 flex items-center gap-2 text-lg font-extrabold">
                      <CheckCircle2 size={20} /> {state.dailyChallenge?.correct ? "Позна днешния въпрос!" : "Опитът е използван"}
                    </div>
                    <p className="mt-1 text-sm font-medium text-white/80">Утре нов въпрос и нов бонус.</p>
                  </>
                ) : (
                  <>
                    <div className="mt-1.5 text-lg font-extrabold">Нов въпрос всеки ден</div>
                    <p className="mt-1 text-sm font-medium text-white/80">
                      Тема: „{q.question.slice(0, 40)}{q.question.length > 40 ? "…" : ""}“
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-extrabold">
                      Отговори · +{q.bonusXp} XP <ArrowRight size={15} />
                    </span>
                  </>
                )}
              </div>
            </CardContent>
            {/* Маскот стрелец в картата */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascots/archer.png"
              alt=""
              draggable={false}
              className="pointer-events-none absolute bottom-0 right-1 h-[168px] w-auto select-none drop-shadow-lg sm:h-[184px] md:h-[205px]"
            />
          </Card>
        </button>

        {/* Седмично — с маскота маратонец вътре */}
        <Link href="/learn" className="cursor-pointer transition-transform hover:scale-[1.01]">
          <Card className={cn(
            "relative h-full overflow-hidden border-none text-white",
            weeklyDoneComplete
              ? "bg-gradient-to-br from-success to-green-700"
              : "bg-gradient-to-br from-violet-500 to-violet-700"
          )}>
            <CardContent className="relative pb-5 pr-40 pt-5 sm:pr-44 md:pr-56">
              <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/70">
                  <CalendarDays size={14} /> Седмично предизвикателство
                </div>
                <div className="mt-1.5 text-lg font-extrabold">{weekly?.title ?? "Тази седмица"}</div>
                <p className="mt-1 text-sm font-medium text-white/80">{weekly?.description}</p>
                {weekly && (
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={(weeklyDone / weekly.target) * 100} className="h-2 flex-1 bg-white/25" barClassName="bg-white" />
                    <span className="shrink-0 text-xs font-bold tabular-nums text-white/90">{weeklyDone}/{weekly.target}</span>
                  </div>
                )}
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-extrabold">
                  {weeklyDoneComplete ? "Изпълнено!" : "Към уроците"} · +{weekly?.xpReward ?? 0} XP <ArrowRight size={15} />
                </span>
              </div>
            </CardContent>
            {/* Маскот маратонец в картата */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascots/marathon.png"
              alt=""
              draggable={false}
              className="pointer-events-none absolute bottom-0 right-0 h-[145px] w-auto select-none drop-shadow-lg sm:h-[160px] md:h-[180px]"
            />
          </Card>
        </Link>
      </div>

      {/* Практически мисии */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
          Практически мисии — приложи наученото наистина
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {PRACTICAL_MISSIONS.map((pm) => {
            const done = !!state.practical[pm.id];
            return (
              <button
                key={pm.id}
                onClick={() => setView(pm.id as View)}
                className="cursor-pointer text-left transition-transform hover:scale-[1.02]"
              >
                <Card className={cn("h-full", done && "border-success/40")}>
                  <CardContent className="flex h-full flex-col pt-5">
                    <div className="flex items-start justify-between">
                      <Thiing name={pm.icon} size={48} />
                      {done ? (
                        <Badge tone="green"><CheckCircle2 size={12} /> Готово</Badge>
                      ) : (
                        <Badge tone="blue">+{pm.xpReward} XP</Badge>
                      )}
                    </div>
                    <div className="mt-3 font-bold leading-snug">{pm.title}</div>
                    <p className="mt-1 flex-1 text-xs font-medium leading-relaxed text-muted">{pm.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-allianz">
                      {done ? "Виж отново" : pm.cta} <ArrowRight size={14} />
                    </span>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </section>

      {/* Автоматични мисии */}
      {(["daily", "weekly", "special"] as const).map((type) => (
        <section key={type} className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            {type === "daily" ? "Днес" : type === "weekly" ? "Тази седмица" : "Специални събития"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MISSIONS.filter((m) => m.type === type).map((mission) => {
            const done = Math.min(progressFor(mission), mission.target);
            const completed = done >= mission.target;
            return (
              <Card key={mission.id} className={completed ? "border-success/40 bg-success/5" : undefined}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{mission.title}</span>
                        <Badge tone={TYPE_META[mission.type].tone}>{TYPE_META[mission.type].label}</Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{mission.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-bold text-allianz tabular-nums">+{mission.xpReward} XP</div>
                      {completed && <div className="flex items-center justify-end gap-1 text-xs font-bold text-success"><CheckCircle2 size={13} /> Готово</div>}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress
                      value={(done / mission.target) * 100}
                      className="flex-1"
                      barClassName={completed ? "bg-success" : undefined}
                    />
                    <span className="text-xs font-semibold tabular-nums text-muted">
                      {done} / {mission.target}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </section>
      ))}
    </div>
  );
}
