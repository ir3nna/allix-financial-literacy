"use client";

// Профил с табове: Преглед (статистики + последна активност), Значки, Любими, Известия, Настройки

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sun, Moon, MonitorSmartphone, Settings2, Heart, Bell,
  BookOpen, Target, Gauge, Flame, Swords, ChevronRight, Brain,
  LayoutDashboard, Award, Lock, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Ring } from "@/components/ui/ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Thiing } from "@/components/thiing";
import { iqFromState, iqTitle } from "@/lib/iq";
import { useGame, type Theme, type Accent } from "@/lib/game-state";
import { BADGES, LESSONS, WORLDS, GRADE_LEVELS, xpForLevel, titleForLevel } from "@/lib/data";
import { cn } from "@/lib/utils";

const AVATARS = ["fox", "bear", "cat", "owl", "panda", "lion", "wolf", "eagle", "tiger", "shark", "butterfly", "frog"];

const THEMES: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Светла", icon: Sun },
  { value: "dark", label: "Тъмна", icon: Moon },
  { value: "system", label: "Авто", icon: MonitorSmartphone },
];

const ACCENTS: { value: Accent; label: string; color: string }[] = [
  { value: "blue", label: "Allianz синьо", color: "#0057FF" },
  { value: "green", label: "Зелено", color: "#059669" },
  { value: "purple", label: "Лилаво", color: "#7C3AED" },
  { value: "orange", label: "Оранжево", color: "#EA580C" },
];

// Цвят на категорията на всяка значка
const BADGE_COLORS: Record<string, string> = {
  "Спестяване": "#22C55E",
  "Банкиране": "#0057FF",
  "Инвестиции": "#10B981",
  "Застраховки": "#8B5CF6",
  "Безопасност": "#EF4444",
  "Постоянство": "#F59E0B",
  "Дуели": "#E11D48",
};

const TABS = [
  { key: "overview", label: "Преглед", icon: LayoutDashboard },
  { key: "badges", label: "Значки", icon: Award },
  { key: "favorites", label: "Любими", icon: Heart },
  { key: "notifications", label: "Известия", icon: Bell },
  { key: "settings", label: "Настройки", icon: Settings2 },
] as const;

type Tab = (typeof TABS)[number]["key"];

const NOTIFICATION_OPTIONS = [
  { key: "dailyReminder", label: "Дневно напомняне за урок", hint: "Лек побутващ сигнал, ако днес още не си учил" },
  { key: "streakWarning", label: "Предупреждение за серията", hint: "Известие вечер, ако серията ти е застрашена" },
  { key: "duelInvites", label: "Покани за дуел", hint: "Когато съученик те предизвика на куиз битка" },
  { key: "finiTips", label: "Съвети от Аликс", hint: "Финансов съвет от орела няколко пъти седмично" },
  { key: "weeklyReport", label: "Седмичен отчет", hint: "Обобщение на XP, уроци и класация всяка неделя" },
];

export default function ProfilePage() {
  const { state, level, updateSettings, toggleFavorite, resetProgress, ready } = useGame();
  const [tab, setTab] = useState<Tab>("overview");
  if (!ready) return null;

  const completed = Object.keys(state.progress).length;
  const xpIntoLevel = state.xp - xpForLevel(level);
  const avgScore = completed
    ? Math.round(Object.values(state.progress).reduce((sum, p) => sum + p.score, 0) / completed)
    : 0;
  const iq = iqFromState(state);

  const stats = [
    { label: "Завършени уроци", value: `${completed} / ${LESSONS.length}`, icon: BookOpen, color: "#0057FF" },
    { label: "Среден резултат", value: `${avgScore}%`, icon: Target, color: "#22C55E" },
    { label: "Перфектни куизове", value: state.perfectQuizzes, icon: Gauge, color: "#8B5CF6" },
    { label: "Серия", value: `${state.streak} дни`, icon: Flame, color: "#F59E0B" },
    { label: "Спечелени дуели", value: `${state.duelsWon} / ${state.duelsPlayed}`, icon: Swords, color: "#EF4444" },
    { label: `Финансов IQ · ${iqTitle(iq)}`, value: iq, icon: Brain, color: "#EC4899" },
  ];

  const favoriteLessons = state.favorites
    .map((id) => LESSONS.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l);

  const recentActivity = Object.entries(state.progress)
    .sort(([, a], [, b]) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 4)
    .map(([id, p]) => ({ lesson: LESSONS.find((l) => l.id === id), p }))
    .filter((r) => !!r.lesson);

  const earnedCount = state.badges.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Заглавна карта */}
      <Card className="overflow-hidden bg-gradient-to-br from-allianz to-allianz-dark text-white">
        <CardContent className="relative pt-6 pb-6">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <Ring value={xpIntoLevel} size={94} stroke={5} trackClassName="text-white/25" barClassName="text-white">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/15 p-1.5">
                  <Thiing name={state.avatar} size={58} />
                </div>
              </Ring>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-allianz shadow-soft tabular-nums">
                {xpIntoLevel}%
              </span>
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-extrabold">{state.name}</h1>
              <p className="text-sm font-medium text-white/75">
                {titleForLevel(level)} · Ниво {level} · {state.xp} XP
              </p>
              <div className="mx-auto mt-2 max-w-xs sm:mx-0">
                <div className="mb-1 flex justify-between text-[11px] font-semibold text-white/70 tabular-nums">
                  <span>Ниво {level}</span>
                  <span>{xpIntoLevel} / 100 до ниво {level + 1}</span>
                </div>
                <Progress value={xpIntoLevel} className="h-2 bg-white/20" barClassName="bg-white" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5">
              <Thiing name="brain" size={30} />
              <div>
                <div className="text-lg font-extrabold leading-tight tabular-nums">{iq}</div>
                <div className="text-[10px] font-bold text-white/75">{iqTitle(iq)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Табове */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-soft p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-bold transition-all cursor-pointer",
              tab === key ? "bg-card text-allianz shadow-sm" : "text-muted hover:text-fg"
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Преглед ── */}
      {tab === "overview" && (
        <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {stats.map((s) => (
              <Card key={s.label} className="overflow-hidden">
                <CardContent
                  className="pt-4 pb-4"
                  style={{ background: `linear-gradient(135deg, ${s.color}14, transparent 65%)` }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${s.color}1f`, color: s.color }}
                  >
                    <s.icon size={18} />
                  </div>
                  <div className="mt-2 text-xl font-extrabold tabular-nums">{s.value}</div>
                  <div className="text-xs font-semibold text-muted">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Последна активност</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {recentActivity.length === 0 ? (
                <p className="rounded-xl bg-soft/60 p-4 text-center text-sm font-medium text-muted">
                  Още няма завършени уроци —{" "}
                  <Link href="/learn" className="font-bold text-allianz hover:underline">започни от Картата</Link>!
                </p>
              ) : (
                recentActivity.map(({ lesson, p }) => {
                  const world = WORLDS.find((w) => w.id === lesson!.worldId)!;
                  return (
                    <Link
                      key={lesson!.id}
                      href={`/lesson/${lesson!.id}`}
                      className="flex items-center gap-3 rounded-xl border border-line/60 bg-soft/40 px-3 py-2.5 transition-colors hover:border-allianz/40 hover:bg-allianz/5"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-1"
                        style={{ backgroundColor: `${world.color}1c` }}
                      >
                        <Thiing name={lesson!.icon} size={32} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{lesson!.title}</span>
                        <span className="text-xs font-semibold text-muted">
                          {new Date(p.completedAt).toLocaleDateString("bg-BG", { day: "numeric", month: "long" })}
                        </span>
                      </span>
                      <Badge tone={p.perfect ? "green" : "blue"}>{p.score}%</Badge>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Значки ── */}
      {tab === "badges" && (
        <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">
              Спечелени <span className="font-extrabold text-fg tabular-nums">{earnedCount} / {BADGES.length}</span>
            </p>
            <Progress value={(earnedCount / BADGES.length) * 100} className="h-2 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {BADGES.map((badge, i) => {
              const earned = state.badges.includes(badge.id);
              const color = BADGE_COLORS[badge.category] ?? "#64748B";
              return (
                <motion.div
                  key={badge.id}
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className={cn("h-full overflow-hidden text-center", earned && "shadow-md")}
                    style={earned ? { borderColor: `${color}66` } : undefined}
                  >
                    <CardContent
                      className="flex h-full flex-col items-center pt-5 pb-5"
                      style={earned ? { background: `linear-gradient(160deg, ${color}16, transparent 70%)` } : undefined}
                    >
                      <div
                        className={cn(
                          "relative flex h-20 w-20 items-center justify-center rounded-full",
                          !earned && "opacity-50"
                        )}
                        style={{
                          background: earned
                            ? `linear-gradient(135deg, ${color}30, ${color}0a)`
                            : "var(--soft)",
                          boxShadow: earned ? `0 0 0 3px ${color}40` : undefined,
                        }}
                      >
                        <Thiing name={badge.icon} size={52} className={earned ? "animate-float" : "grayscale"} />
                        {!earned && (
                          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-line bg-card text-muted">
                            <Lock size={13} />
                          </span>
                        )}
                        {earned && (
                          <span
                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: color }}
                          >
                            <CheckCircle2 size={15} />
                          </span>
                        )}
                      </div>
                      <div className={cn("mt-3 text-sm font-extrabold leading-tight", !earned && "text-muted")}>
                        {badge.name}
                      </div>
                      <Badge tone="gray" className="mt-1.5">{badge.category}</Badge>
                      <p className="mt-2 flex-1 text-xs font-medium leading-relaxed text-muted">
                        {earned ? badge.description : `Как се печели: ${badge.description.toLowerCase()}`}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Любими ── */}
      {tab === "favorites" && (
        <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart size={18} className="fill-danger text-danger" /> Любими уроци ({favoriteLessons.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {favoriteLessons.length === 0 ? (
                <p className="rounded-xl bg-soft/60 p-4 text-center text-sm font-medium text-muted">
                  Натисни <Heart size={13} className="inline text-danger" /> на урок в{" "}
                  <Link href="/learn" className="font-bold text-allianz hover:underline">Картата на знанието</Link>,
                  за да го запазиш тук за бърз достъп.
                </p>
              ) : (
                favoriteLessons.map((lesson) => {
                  const world = WORLDS.find((w) => w.id === lesson.worldId)!;
                  const done = state.progress[lesson.id];
                  return (
                    <Link
                      key={lesson.id}
                      href={`/lesson/${lesson.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-line/60 bg-soft/40 px-3 py-2.5 transition-colors hover:border-allianz/40 hover:bg-allianz/5"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-1 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${world.color}1c` }}
                      >
                        <Thiing name={lesson.icon} size={32} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{lesson.title}</span>
                        <span className="text-xs font-semibold text-muted">
                          {world.name}{done ? ` · ${done.score}%` : ""}
                        </span>
                      </span>
                      <button
                        aria-label="Премахни от любими"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(lesson.id);
                        }}
                        className="rounded-full p-2 transition-transform cursor-pointer hover:scale-125"
                      >
                        <Heart size={17} className="fill-danger text-danger" />
                      </button>
                      <ChevronRight size={16} className="text-muted" />
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Известия ── */}
      {tab === "notifications" && (
        <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={18} className="text-allianz" /> Известия
              </CardTitle>
              <p className="text-sm font-medium text-muted">
                Избери какво да ти напомняме. Известията пристигат в приложението (и по имейл след свързване на акаунт).
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {NOTIFICATION_OPTIONS.map((opt) => {
                const on = state.notifications[opt.key] ?? false;
                return (
                  <button
                    key={opt.key}
                    role="switch"
                    aria-checked={on}
                    onClick={() =>
                      updateSettings({ notifications: { ...state.notifications, [opt.key]: !on } })
                    }
                    className="flex items-center gap-4 rounded-xl border border-line/60 bg-soft/40 px-4 py-3.5 text-left transition-colors cursor-pointer hover:border-allianz/40"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{opt.label}</span>
                      <span className="text-xs font-medium text-muted">{opt.hint}</span>
                    </span>
                    <span
                      className={cn(
                        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                        on ? "bg-allianz" : "bg-line"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all",
                          on ? "left-6" : "left-1"
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Настройки ── */}
      {tab === "settings" && (
        <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 size={18} className="text-allianz" /> Настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Име */}
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-sm font-bold">
                  Име
                </label>
                <input
                  id="profile-name"
                  type="text"
                  maxLength={30}
                  value={state.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                  className="w-full max-w-xs rounded-xl border-2 border-line bg-soft/50 px-4 py-2.5 text-sm font-semibold outline-none transition-colors focus:border-allianz"
                />
              </div>

              {/* Аватар */}
              <div>
                <div className="mb-1.5 text-sm font-bold">Аватар</div>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => updateSettings({ avatar })}
                      aria-label={`Избери аватар ${avatar}`}
                      className={cn(
                        "flex h-24 w-24 items-center justify-center rounded-xl border-2 p-2 transition-all cursor-pointer hover:scale-110",
                        state.avatar === avatar
                          ? "border-allianz bg-allianz/10 shadow-md shadow-allianz/20"
                          : "border-line bg-soft/50"
                      )}
                    >
                      <Thiing name={avatar} size={64} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ниво на съдържанието по клас */}
              <div>
                <div className="mb-1.5 text-sm font-bold">Ниво по клас</div>
                <div className="flex flex-col gap-2">
                  {GRADE_LEVELS.map((lvl) => (
                    <button
                      key={lvl.key}
                      onClick={() => updateSettings({ gradeLevel: lvl.key })}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left transition-all cursor-pointer",
                        state.gradeLevel === lvl.key
                          ? "border-allianz bg-allianz/5"
                          : "border-line bg-soft/50 hover:border-allianz/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold",
                          state.gradeLevel === lvl.key ? "bg-allianz text-white" : "bg-allianz/10 text-allianz"
                        )}
                      >
                        {lvl.key === "V" ? "В" : lvl.key === "B" ? "Б" : "А"}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{lvl.label} · {lvl.grade}</span>
                        <span className="block text-xs font-medium text-muted">{lvl.math}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs font-medium text-muted">
                  Едно съдържание в три нива — математиката се представя според класа ти (напр. сложната лихва: таблица за ниво А, формула за ниво В).
                </p>
              </div>

              {/* Тема */}
              <div>
                <div className="mb-1.5 text-sm font-bold">Тема</div>
                <div className="inline-flex rounded-xl bg-soft p-1">
                  {THEMES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateSettings({ theme: value })}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer",
                        state.theme === value
                          ? "bg-card text-allianz shadow-sm"
                          : "text-muted hover:text-fg"
                      )}
                    >
                      <Icon size={16} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Акцентен цвят */}
              <div>
                <div className="mb-1.5 text-sm font-bold">Акцентен цвят</div>
                <div className="flex gap-3">
                  {ACCENTS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => updateSettings({ accent: value })}
                      title={label}
                      aria-label={label}
                      className={cn(
                        "h-10 w-10 rounded-full transition-all cursor-pointer hover:scale-110",
                        state.accent === value && "ring-4 ring-offset-2 ring-offset-card"
                      )}
                      style={{
                        backgroundColor: color,
                        ...(state.accent === value ? { ["--tw-ring-color" as string]: `${color}55` } : {}),
                      }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs font-medium text-muted">
                  Синьото е класическият Allianz облик — но твоят профил, твоите правила.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Нулиране (за демо) */}
          <Card>
            <CardContent className="flex items-center justify-between pt-4 pb-4">
              <div>
                <div className="text-sm font-semibold">Нулирай прогреса</div>
                <div className="text-xs text-muted">Изтрива XP, значки и уроци — настройките се запазват (демо функция)</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Сигурен ли си? Целият прогрес ще бъде изтрит.")) resetProgress();
                }}
              >
                Нулирай
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
