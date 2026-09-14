"use client";

// Начало: обобщаващ hero блок (мотивиращ текст + илюстрация + статус), после „Продължи от тук",
// бързи действия (Дуел с AI, Дневен въпрос, Дневна мисия), Твоите светове, Съвет + Топ 3.

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight, Zap, Play, CheckCircle2, Swords, ArrowRight, Lightbulb, BookOpen,
  Star, Flame, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Ring } from "@/components/ui/ring";
import { Thiing } from "@/components/thiing";
import { useGame } from "@/lib/game-state";
import { iqFromState, iqTitle } from "@/lib/iq";
import {
  LESSONS, WORLDS, CLASS_LEADERBOARD, DAILY_TIPS, xpForLevel, titleForLevel,
  recommendedAiFor, todaysDailyQuestion,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const MEDALS = ["gold-medal", "silver-medal", "bronze-medal"];

export default function Dashboard() {
  const { state, level, ready } = useGame();

  if (!ready) return null;

  const nextLesson = LESSONS.find((l) => !state.progress[l.id]);
  const nextWorld = nextLesson ? WORLDS.find((w) => w.id === nextLesson.worldId) : null;
  const today = new Date().toISOString().slice(0, 10);
  const completedToday = Object.values(state.progress).filter(
    (p) => p.completedAt.slice(0, 10) === today
  ).length;
  const unlockedWorlds = WORLDS.filter((w) => level >= w.requiredLevel);
  const ai = recommendedAiFor(level);
  const dailyQ = todaysDailyQuestion();
  const dailyDone = state.dailyChallenge?.date === today;
  const missionDone = completedToday >= 1;
  const tip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

  const xpIntoLevel = state.xp - xpForLevel(level);
  const iq = iqFromState(state);


  // Какви постижения може да спечели ученикът днес
  const todayGoals = [
    { label: "Завърши урок", xp: 30, done: missionDone, Icon: BookOpen },
    { label: "Дневен въпрос", xp: 40, done: dailyDone, Icon: Sparkles },
    { label: "Спечели дуел", xp: 150, done: false, Icon: Swords },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── Скъсена HERO секция ── */}
      <motion.div initial={{ y: 10 }} animate={{ y: 0 }} className="relative">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-allianz to-allianz-dark text-white shadow-lg shadow-allianz/25">
          <CardContent className="relative flex flex-col gap-3 pt-5 pb-5 md:gap-4 md:pt-6 md:pb-6">
            <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />

            {/* Текст + постижения за днес */}
            <div className="relative z-10 sm:pr-40 md:pr-56">
              <h1 className="text-2xl font-extrabold leading-tight md:text-3xl">
                Здравей, {state.name}! 👋
              </h1>
              <p className="mt-1 text-sm font-semibold text-white/85">Какви постижения можеш да спечелиш днес:</p>

              {/* Постижения за днес */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {todayGoals.map((g) => (
                  <span
                    key={g.label}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                      g.done ? "bg-white/30" : "bg-white/15"
                    )}
                  >
                    {g.done ? <CheckCircle2 size={12} className="text-emerald-200" /> : <g.Icon size={12} />}
                    {g.label} <span className="font-semibold text-white/70">+{g.xp} XP</span>
                  </span>
                ))}
              </div>

              {/* Ключови статистики */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold tabular-nums">
                  Ниво {level}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold tabular-nums">
                  <Star size={11} fill="currentColor" /> {state.xp} XP
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold tabular-nums">
                  <Flame size={11} className="text-orange-300" fill="currentColor" /> {state.streak}д
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Маскот Аликс — изкача извън синята лента отгоре и отдолу */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mascot-hero.png"
          alt="Аликс"
          draggable={false}
          className="pointer-events-none absolute right-3 top-1/2 z-20 hidden h-[200px] w-auto -translate-y-[62%] select-none drop-shadow-xl sm:block md:right-8 md:h-[230px]"
        />
      </motion.div>

      {/* ── Продължи от тук ── */}
      {nextLesson && nextWorld ? (
        <Card className="transition-shadow hover:shadow-soft-hover">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl p-2"
                style={{ backgroundColor: `${nextWorld.color}1c` }}
              >
                <Thiing name={nextLesson.icon} size={52} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">
                  Продължи от тук · {nextWorld.name}
                </div>
                <div className="text-lg font-extrabold leading-tight">{nextLesson.title}</div>
                <div className="text-sm font-medium text-muted">
                  {nextLesson.duration} · +{nextLesson.xpReward} XP
                </div>
              </div>
            </div>
            <Link href={`/lesson/${nextLesson.id}`} className="shrink-0">
              <Button size="lg" className="w-full sm:w-auto">
                <Play size={18} fill="currentColor" /> Старт
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <Thiing name="trophy" size={64} />
            <p className="mt-2 font-semibold">Завършил си всички налични уроци — легенда!</p>
          </CardContent>
        </Card>
      )}

      {/* ── Бързи действия: Дуел с AI · Дневен въпрос · Дневна мисия ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Дуел с AI */}
        <Link href="/duel" className="group">
          <Card className="h-full overflow-hidden border-danger/30 transition-shadow hover:shadow-soft-hover">
            <CardContent
              className="relative flex h-full flex-col pt-5 pb-5"
              style={{ background: "linear-gradient(150deg, #EF444414, transparent 60%)" }}
            >
              <div className="flex items-start justify-between">
                <div className="animate-float">
                  <Thiing name={ai.avatar} size={48} />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-extrabold text-danger">
                  <Swords size={12} /> Симулатор с AI
                </span>
              </div>
              <div className="mt-3 font-extrabold leading-snug">Влез в ролята срещу {ai.name}</div>
              <p className="mt-0.5 flex-1 text-xs font-medium leading-relaxed text-muted">
                AI играе скептичен клиент, продавач или консултант — ти вземаш решението. Наградата е резултатът, не победа над бота.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-allianz transition-transform group-hover:translate-x-1">
                Към симулатора <ArrowRight size={14} />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Дневен въпрос */}
        <Link href="/missions" className="group">
          <Card
            className={cn(
              "h-full overflow-hidden transition-shadow hover:shadow-soft-hover",
              dailyDone ? "border-success/40" : "border-allianz/30"
            )}
          >
            <CardContent
              className="relative flex h-full flex-col pt-5 pb-5"
              style={{
                background: dailyDone
                  ? "linear-gradient(150deg, #22C55E14, transparent 60%)"
                  : "linear-gradient(150deg, #0057FF12, transparent 60%)",
              }}
            >
              <div className="flex items-start justify-between">
                <div className={cn(!dailyDone && "animate-float")}>
                  <Thiing name="target" size={48} />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
                    dailyDone ? "bg-success/10 text-success" : "bg-allianz/10 text-allianz"
                  )}
                >
                  <Zap size={12} /> Дневен въпрос
                </span>
              </div>
              {dailyDone ? (
                <>
                  <div className="mt-3 flex items-center gap-1.5 font-extrabold leading-snug">
                    <CheckCircle2 size={16} className="text-success" /> Днешният е решен!
                  </div>
                  <p className="mt-0.5 flex-1 text-xs font-medium leading-relaxed text-muted">
                    {state.dailyChallenge?.correct ? "Позна въпроса — браво! Утре нов." : "Утре нов въпрос, нов бонус."}
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-3 font-extrabold leading-snug">Всеки ден нов въпрос</div>
                  <p className="mt-0.5 flex-1 text-xs font-medium leading-relaxed text-muted">
                    „{dailyQ.question.slice(0, 45)}…“ · +{dailyQ.bonusXp} XP при верен отговор
                  </p>
                </>
              )}
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-allianz transition-transform group-hover:translate-x-1">
                {dailyDone ? "Виж мисиите" : "Отговори сега"} <ArrowRight size={14} />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Дневна мисия */}
        <Link href={missionDone ? "/missions" : nextLesson ? `/lesson/${nextLesson.id}` : "/learn"} className="group sm:col-span-2 lg:col-span-1">
          <Card
            className={cn(
              "h-full overflow-hidden transition-shadow hover:shadow-soft-hover",
              missionDone ? "border-success/40" : "border-warning/40"
            )}
          >
            <CardContent
              className="relative flex h-full flex-col pt-5 pb-5"
              style={{
                background: missionDone
                  ? "linear-gradient(150deg, #22C55E14, transparent 60%)"
                  : "linear-gradient(150deg, #F59E0B14, transparent 60%)",
              }}
            >
              <div className="flex items-start justify-between">
                <div className={cn(!missionDone && "animate-float")}>
                  <Thiing name="fire" size={48} />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
                    missionDone ? "bg-success/10 text-success" : "bg-warning/10 text-amber-700 dark:text-amber-400"
                  )}
                >
                  <BookOpen size={12} /> Дневна мисия
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 font-extrabold leading-snug">
                {missionDone && <CheckCircle2 size={16} className="text-success" />}
                Завърши 1 урок днес
              </div>
              <div className="mt-2 flex flex-1 items-start gap-3">
                <Progress
                  value={missionDone ? 100 : 0}
                  className="mt-1 h-2 flex-1"
                  barClassName={missionDone ? "bg-success" : undefined}
                />
                <span className="text-xs font-bold text-muted tabular-nums">{Math.min(completedToday, 1)} / 1 · +30 XP</span>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-allianz transition-transform group-hover:translate-x-1">
                {missionDone ? "Изпълнена — виж мисиите" : "Учи сега"} <ArrowRight size={14} />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Твоите светове ── */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Твоите светове</CardTitle>
          <Link href="/learn" className="flex items-center text-sm font-bold text-allianz hover:underline">
            Карта <ChevronRight size={16} />
          </Link>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {unlockedWorlds.map((world) => {
            const lessons = LESSONS.filter((l) => l.worldId === world.id);
            const done = lessons.filter((l) => state.progress[l.id]).length;
            const pct = lessons.length ? (done / lessons.length) * 100 : 0;
            return (
              <Link
                key={world.id}
                href="/learn"
                className="rounded-2xl border border-line bg-soft/40 p-4 transition-colors hover:border-allianz/40 hover:bg-allianz/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-1"
                    style={{ backgroundColor: `${world.color}20` }}
                  >
                    <Thiing name={world.icon} size={36} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{world.name}</div>
                    <div className="text-xs font-semibold text-muted tabular-nums">
                      {done} / {lessons.length} урока
                    </div>
                  </div>
                </div>
                <Progress
                  value={pct}
                  className="mt-3 h-2"
                  barClassName={pct === 100 ? "bg-success" : undefined}
                />
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Класация клас срещу клас + Статистика ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold">Клас срещу клас</span>
              <Link href="/leaderboard" className="flex items-center text-xs font-bold text-allianz hover:underline">
                Всички <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {(() => {
                // Твоят напредък изкачва класа „8А“ — не личен сбор от точки
                const contribution = Math.round((Object.keys(state.progress).length / LESSONS.length) * 40);
                const myClass = { name: "8А", school: "СМГ, София", progress: Math.min(100, 38 + contribution), isMyClass: true };
                const base = CLASS_LEADERBOARD.school.filter((c) => c.name !== myClass.name);
                const ranked = [...base, myClass].sort((a, b) => b.progress - a.progress).slice(0, 3);
                const medal = ["#F59E0B1f", "#8494ab1f", "#CD7F321f"];
                return ranked.map((c, i) => (
                  <div
                    key={c.name}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2",
                      c.isMyClass ? "border-2 border-allianz bg-allianz/5" : "bg-soft/60"
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold" style={{ background: medal[i] }}>
                      {i + 1}
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-allianz/10 text-[11px] font-extrabold text-allianz">
                      {c.name}
                    </span>
                    <span className="flex-1 truncate text-sm font-semibold">
                      {c.school}
                      {c.isMyClass && " (ти)"}
                    </span>
                    <span className="text-xs font-semibold text-muted tabular-nums">{c.progress}%</span>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-bold">Твоя прогрес</span>
            </div>
            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted mb-1">
                  <span>Завършени уроци</span>
                  <span className="tabular-nums">{Object.keys(state.progress).length} / {LESSONS.length}</span>
                </div>
                <Progress value={(Object.keys(state.progress).length / LESSONS.length) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted mb-1">
                  <span>XP към ниво {level + 1}</span>
                  <span className="tabular-nums">{xpIntoLevel} / 100</span>
                </div>
                <Progress value={xpIntoLevel} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                <div className="rounded-lg bg-soft/60 p-2 text-center">
                  <div className="text-xs font-bold tabular-nums">{state.badges.length}</div>
                  <div className="text-[10px] text-muted">Значки</div>
                </div>
                <div className="rounded-lg bg-soft/60 p-2 text-center">
                  <div className="text-xs font-bold tabular-nums">{state.duelsWon}</div>
                  <div className="text-[10px] text-muted">Дуели</div>
                </div>
                <div className="rounded-lg bg-soft/60 p-2 text-center">
                  <div className="text-xs font-bold tabular-nums">{iq}</div>
                  <div className="text-[10px] text-muted">IQ</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
