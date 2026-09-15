"use client";

// Карта на световете: градиентни карти с Thiings илюстрации, отключени/заключени състояния,
// прогрес и любими уроци (♥)

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Clock, Map } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Thiing } from "@/components/thiing";
import { useGame } from "@/lib/game-state";
import { WORLDS, LESSONS, GRADE_LEVELS, gradeLevelInfo, worldTierLabel, type World } from "@/lib/data";
import { cn } from "@/lib/utils";

// Илюстрация на света: 3D изображение (public/worlds/*.png), а при липса/грешка — Thiings иконка.
function WorldImage({ world }: { world: World }) {
  const [failed, setFailed] = useState(false);
  if (world.image && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={world.image}
        alt={world.name}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        draggable={false}
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Thiing name={world.icon} size={120} />
    </div>
  );
}

export default function LearnPage() {
  const { state, level, updateSettings, ready } = useGame();
  if (!ready) return null;

  const activeLevel = gradeLevelInfo(state.gradeLevel);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
          <Map size={26} className="text-allianz" /> Уроци
        </h1>
        <p className="text-sm font-medium text-muted">Всяка завършена тема ви носи нови знания и награди</p>
      </div>

      {/* Избор на ниво по клас — едно съдържание, представено според математиката на ученика */}
      <div className="rounded-2xl border border-line/70 bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-extrabold">Ниво на съдържанието</div>
            <div className="text-xs font-medium text-muted">
              {activeLevel.grade} · {activeLevel.math}
            </div>
          </div>
          <div className="flex rounded-xl bg-soft p-1">
            {GRADE_LEVELS.map((lvl) => (
              <button
                key={lvl.key}
                onClick={() => updateSettings({ gradeLevel: lvl.key })}
                title={`${lvl.grade} · ${lvl.math}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  state.gradeLevel === lvl.key ? "bg-card text-allianz shadow-sm" : "text-muted hover:text-fg"
                )}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDS.map((world, i) => {
          const lessons = LESSONS.filter((l) => l.worldId === world.id);
          const done = lessons.filter((l) => state.progress[l.id]).length;
          const unlocked = level >= world.requiredLevel;
          const completed = lessons.length > 0 && done === lessons.length;
          const totalMin = lessons.reduce((sum, l) => sum + (parseInt(l.duration) || 0), 0);

          return (
            <motion.div
              key={world.id}
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-full"
            >
              <Link href={`/learn/${world.id}`} className="block h-full">
              <Card
                className={cn(
                  "group flex h-full flex-col overflow-hidden transition-all duration-300 ease-out",
                  unlocked ? "hover:-translate-y-1 hover:shadow-xl cursor-pointer" : "opacity-65 grayscale-[50%]"
                )}
              >
                {/* Илюстрация на света — по-нисък кадър, за да покрива изцяло */}
                <div
                  className="relative aspect-[3/2] shrink-0 overflow-hidden"
                  style={{ backgroundColor: `${world.color}14` }}
                >
                  <WorldImage world={world} />

                  {/* Таг за ниво (горе вдясно) */}
                  <span className="absolute right-3 top-3 inline-flex rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-fg shadow-sm backdrop-blur">
                    {worldTierLabel(world.requiredLevel)}
                  </span>

                  {/* Завършен / заключен */}
                  {completed && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      <CheckCircle2 size={12} /> Завършен
                    </span>
                  )}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-extrabold text-white">
                        <Lock size={13} /> Ниво {world.requiredLevel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Съдържание */}
                <CardContent className="flex flex-1 flex-col gap-3 pt-4">
                  <h2 className="text-lg font-extrabold leading-tight">{world.name}</h2>
                  <p className="text-sm text-fg/75">{world.description}</p>

                  {/* Напредък по модула */}
                  <div className="mt-auto pt-1">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
                      <span>Напредък</span>
                      <span className="tabular-nums">{done} / {lessons.length}</span>
                    </div>
                    <Progress
                      value={lessons.length ? (done / lessons.length) * 100 : 0}
                      className="h-2"
                      barClassName={completed ? "bg-success" : undefined}
                    />
                  </div>

                  {/* Таги */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-soft px-3 py-1.5 text-xs font-semibold text-muted">
                      <Clock size={14} /> {totalMin} мин
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-allianz/10 px-3 py-1.5 text-xs font-semibold text-allianz">
                      {lessons.length} урока
                    </span>
                  </div>
                </CardContent>
              </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
