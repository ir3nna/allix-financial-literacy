"use client";

import { Suspense } from "react";

// Родителски портал: табове в сайдбара — Преглед, Силни и слаби страни, Активност, Препоръки.
// Чете реалния прогрес на ученика от това устройство (демо).
// В продукция: връзка родител–дете чрез код за покана и Supabase Auth роля "parent".

import { useSearchParams } from "next/navigation";
import {
  TrendingUp, TrendingDown, Lightbulb, CalendarDays, Flame, Gauge, BookOpen,
  Award, Swords, MessageCircleHeart, Mail, ShieldCheck, History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thiing } from "@/components/thiing";
import { PortalTabs } from "@/components/portal-tabs";
import { useGame } from "@/lib/game-state";
import { iqFromState, iqTitle } from "@/lib/iq";
import { LESSONS, WORLDS, titleForLevel } from "@/lib/data";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"];

// Идеи за семейни разговори по темите от платформата — статични, сменят се с урока на седмицата
const FAMILY_ACTIVITIES = [
  { icon: "shopping-cart", title: "Пазарувайте с бюджет", text: "Дайте на детето списък и фиксирана сума за седмичното пазаруване — нека то смята и решава при замени." },
  { icon: "piggy-bank", title: "Обща спестовна цел", text: "Изберете заедно цел (излет, игра, колело) и открита касичка/подсметка — детето следи прогреса всяка седмица." },
  { icon: "burger", title: "„Колко струва вечерята?“", text: "На масата: познайте общата цена на продуктите в едно ястие. Който е най-близо, избира десерта." },
  { icon: "padlock", title: "Лов на фишинг", text: "Разгледайте заедно съмнителен имейл или SMS и открийте трите червени флага — спешност, странен линк, искане на данни." },
];

function ParentPortalInner() {
  const { state, level, ready, updateSettings } = useGame();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  if (!ready) return null;

  const iq = iqFromState(state);
  const completed = Object.entries(state.progress);
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, [, p]) => s + p.score, 0) / completed.length)
    : 0;

  const worldStats = WORLDS.map((world) => {
    const lessons = LESSONS.filter((l) => l.worldId === world.id);
    const done = lessons.filter((l) => state.progress[l.id]);
    const avg = done.length
      ? Math.round(done.reduce((s, l) => s + state.progress[l.id].score, 0) / done.length)
      : null;
    return { world, total: lessons.length, doneCount: done.length, avg };
  });
  const strengths = worldStats.filter((w) => w.avg !== null && w.avg >= 80);
  const weaknesses = worldStats.filter((w) => w.avg !== null && w.avg < 60);
  const weakLessons = completed
    .filter(([, p]) => p.score < 60)
    .map(([id, p]) => ({ lesson: LESSONS.find((l) => l.id === id)!, p }))
    .filter((x) => x.lesson);

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return {
      label: DAY_LABELS[d.getDay()],
      count: completed.filter(([, p]) => p.completedAt.slice(0, 10) === key).length,
    };
  });
  const maxCount = Math.max(1, ...week.map((d) => d.count));
  const activeDays = week.filter((d) => d.count > 0).length;

  const recommendations: string[] = [];
  for (const w of weaknesses) {
    recommendations.push(
      `Прегледайте заедно света „${w.world.name}“ — средният резултат там е ${w.avg}%. Повторението на урок носи половин XP, така че няма „наказание“ за втори опит.`
    );
  }
  for (const { lesson, p } of weakLessons.slice(0, 2)) {
    recommendations.push(`Урокът „${lesson.title}“ е затруднил ${state.name} (${p.score}%) — 10 минути заедно ще решат въпроса.`);
  }
  if (state.streak <= 1) {
    recommendations.push("Серията е прекъсната — кратък 10-минутен навик всяка вечер (един урок или дневния въпрос) е най-сигурният път към резултати.");
  }
  if (state.duelsPlayed === 0) {
    recommendations.push("Дуелите затвърждават наученото по забавен начин — предложете приятелско предизвикателство срещу Фин-бот.");
  }
  if (Object.keys(state.practical).length < 3) {
    recommendations.push("Практическите мисии са чудесна семейна активност — „Проследи семейните разходи за един ден“ се прави заедно на масата.");
  }
  if (recommendations.length === 0) {
    recommendations.push(`${state.name} се справя отлично по всички показатели — поздравления! Следващата стъпка са по-трудните светове и дуелите срещу Фин Майстор.`);
  }

  const unlockedWorlds = worldStats.filter((w) => level >= w.world.requiredLevel);

  // Последно завършени уроци — хронология за родителя
  const recentLessons = completed
    .map(([id, p]) => ({ lesson: LESSONS.find((l) => l.id === id), p }))
    .filter((x): x is { lesson: (typeof LESSONS)[number]; p: (typeof completed)[number][1] } => Boolean(x.lesson))
    .sort((a, b) => b.p.completedAt.localeCompare(a.p.completedAt))
    .slice(0, 6);

  const StrengthsWeaknesses = (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="border-success/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <TrendingUp size={18} /> Силни страни
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {strengths.length === 0 ? (
            <p className="rounded-xl bg-soft/60 p-4 text-sm font-medium text-muted">
              Още няма завършени светове с висок резултат — всичко предстои!
            </p>
          ) : (
            strengths.map(({ world, avg, doneCount, total }) => (
              <div key={world.id} className="flex items-center gap-3 rounded-xl bg-success/5 px-3 py-2.5">
                <Thiing name={world.icon} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{world.name}</div>
                  <div className="text-xs font-semibold text-muted">{doneCount} / {total} урока</div>
                </div>
                <Badge tone="green">{avg}%</Badge>
              </div>
            ))
          )}
          {state.perfectQuizzes > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-success/5 px-3 py-2.5">
              <Thiing name="trophy" size={32} />
              <div className="flex-1 text-sm font-bold">Перфектни куизове</div>
              <Badge tone="green">{state.perfectQuizzes}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-warning/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <TrendingDown size={18} /> Нужда от внимание
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {weaknesses.length === 0 && weakLessons.length === 0 ? (
            <p className="rounded-xl bg-soft/60 p-4 text-sm font-medium text-muted">
              Няма теми с нисък резултат — чудесно представяне!
            </p>
          ) : (
            <>
              {weaknesses.map(({ world, avg }) => (
                <div key={world.id} className="flex items-center gap-3 rounded-xl bg-warning/5 px-3 py-2.5">
                  <Thiing name={world.icon} size={32} />
                  <div className="flex-1 text-sm font-bold">{world.name}</div>
                  <Badge tone="orange">{avg}%</Badge>
                </div>
              ))}
              {weakLessons.map(({ lesson, p }) => (
                <div key={lesson.id} className="flex items-center gap-3 rounded-xl bg-warning/5 px-3 py-2.5">
                  <Thiing name={lesson.icon} size={32} />
                  <div className="flex-1 text-sm font-bold">{lesson.title}</div>
                  <Badge tone="orange">{p.score}%</Badge>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const ActivityChart = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays size={18} className="text-allianz" /> Активност (последните 7 дни)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end justify-between gap-3">
          {week.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-bold text-muted tabular-nums">{d.count > 0 ? d.count : ""}</span>
              <div
                className={cn("w-full rounded-t-lg transition-all", d.count > 0 ? "bg-allianz" : "bg-soft")}
                style={{ height: `${Math.max(8, (d.count / maxCount) * 120)}px` }}
              />
              <span className="text-[10px] font-bold uppercase text-muted">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-medium text-muted">Завършени уроци на ден · активни {activeDays} от 7 дни</p>
      </CardContent>
    </Card>
  );

  const RecentLessons = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History size={18} className="text-allianz" /> Последни уроци
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {recentLessons.length === 0 ? (
          <p className="rounded-xl bg-soft/60 p-4 text-sm font-medium text-muted">
            Още няма завършени уроци — първият е най-важната крачка.
          </p>
        ) : (
          recentLessons.map(({ lesson, p }) => (
            <div key={lesson.id} className="flex items-center gap-3 rounded-xl bg-soft/50 px-3 py-2.5">
              <Thiing name={lesson.icon} size={30} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{lesson.title}</div>
                <div className="text-xs font-semibold text-muted">
                  {new Date(p.completedAt).toLocaleDateString("bg-BG", { day: "numeric", month: "long" })}
                  {p.perfect && " · перфектен куиз"}
                </div>
              </div>
              <Badge tone={p.score >= 80 ? "green" : p.score >= 60 ? "blue" : "orange"}>{p.score}%</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  const EngagementStats = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords size={18} className="text-allianz" /> Игри и практика
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {[
          { icon: "sword", label: "Дуели (спечелени)", value: `${state.duelsPlayed} (${state.duelsWon})` },
          { icon: "target", label: "Практически мисии", value: `${Object.keys(state.practical).length} / 3` },
          { icon: "trophy", label: "Значки", value: `${state.badges.length}` },
          { icon: "calculator", label: "Верни дневни въпроса", value: `${state.dailyCorrectCount}` },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-xl bg-soft/50 px-3 py-2.5">
            <Thiing name={s.icon} size={28} />
            <div className="min-w-0">
              <div className="text-sm font-extrabold tabular-nums">{s.value}</div>
              <div className="truncate text-[11px] font-semibold text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const WorldProgress = (
    <Card>
      <CardHeader>
        <CardTitle>Прогрес по светове</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-x-6 gap-y-3 md:grid-cols-2">
        {unlockedWorlds.map(({ world, doneCount, total }) => (
          <div key={world.id}>
            <div className="mb-1 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5"><Thiing name={world.icon} size={18} /> {world.name}</span>
              <span className="text-muted tabular-nums">{doneCount} / {total}</span>
            </div>
            <Progress value={total ? (doneCount / total) * 100 : 0} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Обзор на детето — винаги видим */}
      <Card className="overflow-hidden bg-gradient-to-br from-allianz to-allianz-dark text-white">
        <CardContent className="relative pt-5 pb-5">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative flex flex-wrap items-center gap-x-10 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 p-1.5">
                <Thiing name={state.avatar} size={44} />
              </div>
              <div>
                <div className="text-lg font-extrabold">{state.name}</div>
                <div className="text-xs font-semibold text-white/75">{titleForLevel(level)} · Ниво {level}</div>
              </div>
            </div>
            {[
              { label: "Финансов IQ", value: `${iq} · ${iqTitle(iq)}` },
              { label: "Завършени уроци", value: `${completed.length} / ${LESSONS.length}` },
              { label: "Среден резултат", value: `${avgScore}%` },
              { label: "Серия", value: `${state.streak} дни` },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[10px] font-bold uppercase tracking-wide text-white/60">{s.label}</div>
                <div className="font-extrabold tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Табове на портала (мобилни) */}
      <PortalTabs base="/parent" />

      {/* ── Преглед ── */}
      {tab === "overview" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Завършени уроци", value: `${completed.length} / ${LESSONS.length}`, icon: BookOpen, color: "#0057FF" },
              { label: "Среден резултат", value: `${avgScore}%`, icon: Gauge, color: "#22C55E" },
              { label: "Активни дни (7)", value: `${activeDays} / 7`, icon: Flame, color: "#F59E0B" },
              { label: "Спечелени значки", value: `${state.badges.length}`, icon: Award, color: "#A855F7" },
            ].map((s) => (
              <Card key={s.label} className="overflow-hidden">
                <CardContent className="flex items-center gap-3 pt-4 pb-4" style={{ background: `linear-gradient(135deg, ${s.color}14, transparent 65%)` }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${s.color}1f`, color: s.color }}>
                    <s.icon size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold tabular-nums">{s.value}</div>
                    <div className="text-xs font-semibold text-muted">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {WorldProgress}
          {StrengthsWeaknesses}
          <div className="grid gap-5 lg:grid-cols-2">
            {RecentLessons}
            {EngagementStats}
          </div>
        </div>
      )}

      {/* ── Силни и слаби страни ── */}
      {tab === "strengths" && (
        <div className="flex flex-col gap-5">
          {StrengthsWeaknesses}
          {RecentLessons}
        </div>
      )}

      {/* ── Активност ── */}
      {tab === "activity" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {ActivityChart}
            {WorldProgress}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {RecentLessons}
            {EngagementStats}
          </div>
        </div>
      )}

      {/* ── Препоръки ── */}
      {tab === "recommendations" && (
        <div className="flex flex-col gap-5">
          <Card className="border-allianz/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb size={18} className="text-allianz" /> Препоръки за вас
              </CardTitle>
              <p className="text-sm font-medium text-muted">Генерирани от реалните резултати на {state.name}</p>
            </CardHeader>
            <CardContent className="grid gap-2 lg:grid-cols-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-allianz/5 px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-allianz text-xs font-extrabold text-white tabular-nums">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Семейни активности по темите от платформата */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleHeart size={18} className="text-allianz" /> Семейни активности
              </CardTitle>
              <p className="text-sm font-medium text-muted">
                15 минути на седмица са достатъчни — финансовите навици се учат най-добре у дома
              </p>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {FAMILY_ACTIVITIES.map((a) => (
                <div key={a.title} className="flex items-start gap-3 rounded-xl bg-soft/50 px-4 py-3">
                  <Thiing name={a.icon} size={34} />
                  <div>
                    <div className="text-sm font-bold">{a.title}</div>
                    <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">{a.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Седмичен отчет по имейл + бележка за поверителност */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-4 pt-4 pb-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-allianz/10 text-allianz">
                  <Mail size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">Седмичен отчет по имейл</div>
                  <p className="text-xs font-medium text-muted">
                    Кратко резюме всяка неделя: уроци, резултати и серия на {state.name}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={!!state.notifications.weeklyReport}
                  aria-label="Седмичен отчет по имейл"
                  onClick={() =>
                    updateSettings({
                      notifications: { ...state.notifications, weeklyReport: !state.notifications.weeklyReport },
                    })
                  }
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer",
                    state.notifications.weeklyReport ? "bg-allianz" : "bg-line"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all",
                      state.notifications.weeklyReport ? "left-6" : "left-1"
                    )}
                  />
                </button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-4 pt-4 pb-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-green-700 dark:text-green-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold">Поверителност</div>
                  <p className="text-xs font-medium leading-relaxed text-muted">
                    Виждате само учебния напредък — без съобщения и лични данни. Платформата не съветва за
                    реални пари и не събира финансова информация за семейството.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParentPortal() {
  return (
    <Suspense fallback={null}>
      <ParentPortalInner />
    </Suspense>
  );
}
