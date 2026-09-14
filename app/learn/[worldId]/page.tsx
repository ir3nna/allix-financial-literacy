"use client";

// Страница на модул: хедър с илюстрация + описание, после списък с уроците на модула.

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle2, Clock, Star, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Thiing } from "@/components/thiing";
import { useGame } from "@/lib/game-state";
import { WORLDS, LESSONS, worldTierLabel } from "@/lib/data";

export default function WorldPage({ params }: { params: Promise<{ worldId: string }> }) {
  const { worldId } = use(params);
  const { state, level, ready } = useGame();
  if (!ready) return null;

  const world = WORLDS.find((w) => String(w.id) === worldId);
  if (!world) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Модулът не е намерен</p>
        <Link href="/learn" className="text-allianz hover:underline">Обратно към уроците</Link>
      </div>
    );
  }

  const lessons = LESSONS.filter((l) => l.worldId === world.id);
  const done = lessons.filter((l) => state.progress[l.id]).length;
  const unlocked = level >= world.requiredLevel;
  const totalMin = lessons.reduce((s, l) => s + (parseInt(l.duration) || 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {/* Назад */}
      <Link href="/learn" className="inline-flex w-fit items-center gap-1 text-sm font-bold text-muted transition-colors hover:text-fg">
        <ArrowLeft size={16} /> Всички уроци
      </Link>

      {/* Хедър на модула */}
      <Card className="overflow-hidden">
        <div className="relative h-40 overflow-hidden md:h-48" style={{ backgroundColor: `${world.color}14` }}>
          {world.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={world.image} alt={world.name} className="h-full w-full object-cover" draggable={false} />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Thiing name={world.icon} size={120} />
            </div>
          )}
          <span className="absolute right-3 top-3 inline-flex rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-fg shadow-sm backdrop-blur">
            {worldTierLabel(world.requiredLevel)}
          </span>
        </div>
        <CardContent className="pt-4">
          <h1 className="text-xl font-extrabold md:text-2xl">{world.name}</h1>
          <p className="mt-1 text-sm text-fg/75">{world.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-soft px-3 py-1.5 text-xs font-semibold text-muted">
              <Clock size={14} /> {totalMin} мин
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-allianz/10 px-3 py-1.5 text-xs font-semibold text-allianz">
              {done} / {lessons.length} урока
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Заключен модул */}
      {!unlocked ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <Lock size={40} className="text-muted" />
            <p className="font-bold">Модулът е заключен</p>
            <p className="text-sm text-muted">Достигни ниво {world.requiredLevel}, за да го отключиш.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-muted/70">
            Уроци в модула
          </div>
          {lessons.map((lesson, i) => {
            const p = state.progress[lesson.id];
            const isDone = !!p;
            return (
              <motion.div key={lesson.id} initial={{ y: 8 }} animate={{ y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/lesson/${lesson.id}`}>
                  <Card className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="flex items-center gap-3 py-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${world.color}1c` }}
                      >
                        <Thiing name={lesson.icon} size={30} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold">
                          {isDone && <CheckCircle2 size={14} className="shrink-0 text-success" />}
                          <span className="truncate">{i + 1}. {lesson.title}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2.5 text-xs font-medium text-muted">
                          <span className="inline-flex items-center gap-1"><Clock size={11} /> {lesson.duration}</span>
                          <span className="inline-flex items-center gap-1"><Star size={11} /> +{lesson.xpReward} XP</span>
                          {isDone && <span className="font-bold text-success">{p.score}%</span>}
                        </div>
                      </div>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-allianz/10 text-allianz transition-colors group-hover:bg-allianz group-hover:text-white">
                        <Play size={15} fill="currentColor" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
