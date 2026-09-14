"use client";

// Класация КЛАС СРЕЩУ КЛАС: съревнованието е между паралелки, не между ученици.
// Метриката е среден напредък по деветте модула (нива, не точки) — никой ученик
// не е последен пред съучениците си. Твоят собствен напредък движи класа нагоре.

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Thiing } from "@/components/thiing";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/lib/game-state";
import { CLASS_LEADERBOARD, LESSONS, type ClassEntry } from "@/lib/data";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "school" as const, label: "В училището" },
  { key: "national" as const, label: "Национална" },
];

// Пиедестали: цвят, височина и медал за всяко от първите три места
const PODIUM = [
  { medal: "gold-medal", height: "h-32", numColor: "#F59E0B", bg: "#F59E0B2b" },
  { medal: "silver-medal", height: "h-24", numColor: "#8494ab", bg: "#94A3B833" },
  { medal: "bronze-medal", height: "h-20", numColor: "#B45309", bg: "#CD7F322b" },
];

export default function LeaderboardPage() {
  const { state, ready } = useGame();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("school");
  if (!ready) return null;

  // Твоят собствен напредък е приносът ти към класа: завършените уроци
  // изкачват паралелката „8А“ — а не личен сбор от точки.
  const completed = Object.keys(state.progress).length;
  const myContribution = Math.round((completed / LESSONS.length) * 40);
  const myClass: ClassEntry = {
    name: "8А",
    school: "СМГ, София",
    progress: Math.min(100, 38 + myContribution),
    students: 27,
    isMyClass: true,
  };

  // Вмъкваме моя клас в подредбата и подреждаме по напредък
  const base = CLASS_LEADERBOARD[tab].filter(
    (c) => !(c.name === myClass.name && c.school === myClass.school)
  );
  const rows = [...base, myClass].sort((a, b) => b.progress - a.progress);
  const myRank = rows.findIndex((r) => r.isMyClass) + 1;
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  // Визуален ред на подиума: 2-ро · 1-во · 3-то място
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const ahead = rows[myRank - 2]; // класът точно над мен

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">Класация</h1>
        <p className="text-sm font-medium text-muted">
          Клас срещу клас — състезават се паралелките, не отделните ученици. Всеки завършен урок изкачва твоя клас.
        </p>
      </div>

      {/* Табове */}
      <div className="flex rounded-2xl bg-soft p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-bold transition-all cursor-pointer",
              tab === t.key ? "bg-card text-allianz shadow-sm" : "text-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Подиум: топ 3 класа ── */}
      <Card className="overflow-hidden">
        <CardContent className="pt-8 pb-0 px-4 sm:px-8">
          <div className="mx-auto flex max-w-xl items-end justify-center gap-2 sm:gap-4">
            {podiumOrder.map((entry) => {
              const rank = rows.indexOf(entry) + 1;
              const p = PODIUM[rank - 1];
              return (
                <motion.div
                  key={`${tab}-${entry.name}-${entry.school}`}
                  initial={{ y: 16 }}
                  animate={{ y: 0 }}
                  transition={{ delay: rank === 1 ? 0 : rank === 2 ? 0.08 : 0.16 }}
                  className="flex min-w-0 flex-1 flex-col items-center"
                >
                  {/* Корона за №1 */}
                  {rank === 1 && (
                    <Crown size={22} className="mb-1 text-amber-400" fill="currentColor" />
                  )}

                  {/* Значка на паралелката с медал */}
                  <div className="relative">
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-2xl font-extrabold text-allianz",
                        rank === 1 ? "h-20 w-20 text-2xl" : "h-16 w-16 text-xl",
                        entry.isMyClass ? "bg-allianz text-white ring-4 ring-allianz/40" : "bg-allianz/10"
                      )}
                    >
                      {entry.name}
                    </div>
                    <span className="absolute -bottom-1.5 -right-1.5">
                      <Thiing name={p.medal} size={rank === 1 ? 30 : 26} />
                    </span>
                  </div>

                  {/* Училище и напредък */}
                  <div
                    className={cn(
                      "mt-2 w-full truncate text-center text-xs font-bold",
                      entry.isMyClass ? "text-allianz" : "text-muted"
                    )}
                  >
                    {entry.school}
                    {entry.isMyClass && " · твоят клас"}
                  </div>
                  <div className="text-sm font-extrabold tabular-nums">{entry.progress}%</div>

                  {/* Пиедестал с големия номер */}
                  <div
                    className={cn(
                      "mt-2 flex w-full flex-col items-center justify-start rounded-t-2xl pt-3",
                      p.height
                    )}
                    style={{ background: `linear-gradient(180deg, ${p.bg}, transparent)` }}
                  >
                    <span
                      className="text-4xl font-extrabold leading-none tabular-nums"
                      style={{ color: p.numColor }}
                    >
                      {rank}
                    </span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                      място
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Мотивация */}
      <Card className="border-allianz/20 bg-allianz/5">
        <CardContent className="pt-4 pb-4 text-center text-sm font-semibold text-allianz">
          {myRank === 1
            ? "Класът ти е №1! Задръжте темпото с още завършени уроци."
            : `Класът ти (8А) е №${myRank}. Само ${Math.max(1, (ahead?.progress ?? 0) - myClass.progress)}% напредък ви делят от следващото място!`}
        </CardContent>
      </Card>

      {/* ── Останалите класове ── */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-muted/70">
            Всички паралелки · {TABS.find((t) => t.key === tab)?.label}
          </div>
          {rest.map((entry, i) => {
            const rank = i + 4;
            return (
              <motion.div
                key={`${tab}-${entry.name}-${entry.school}`}
                initial={{ y: 8 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
              >
                <Card
                  className={cn(
                    entry.isMyClass && "border-allianz bg-allianz/5 ring-2 ring-allianz/20"
                  )}
                >
                  <CardContent className="flex items-center gap-3 py-3 pt-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-extrabold tabular-nums",
                        entry.isMyClass
                          ? "bg-allianz text-white"
                          : rank <= 5 ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {rank}
                    </span>
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold",
                        entry.isMyClass ? "bg-allianz/15 text-allianz" : "bg-soft text-fg/70"
                      )}
                    >
                      {entry.name}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={cn("truncate text-sm font-bold", entry.isMyClass && "text-allianz")}>
                        {entry.school}
                        {entry.isMyClass && " · твоят клас"}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={entry.progress} className="h-1.5 flex-1" />
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
                          <Users size={11} /> {entry.students}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold tabular-nums">{entry.progress}%</div>
                      <div className="text-[11px] font-medium text-muted">напредък</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
