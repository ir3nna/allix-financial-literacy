"use client";

// Учителски портал: табове в сайдбара — Обзор на класа, Домашни, Резултати, Отчети.
// Демо: учениците са примерни, класът и домашните се пазят в localStorage;
// в продукция — Supabase роля "teacher" + реални ученици.

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap, Users2, ClipboardList, Download, Plus, Trash2, ArrowLeft, CheckCircle2,
  FileSpreadsheet, AlertTriangle, Medal, Lightbulb, Presentation,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Thiing } from "@/components/thiing";
import { PortalTabs } from "@/components/portal-tabs";
import { LESSONS, WORLDS, titleForLevel } from "@/lib/data";

const STUDENTS = [
  { name: "Мария Иванова", avatar: "fox", level: 25, xp: 2450, completed: 14, avgScore: 92, lastActive: "днес" },
  { name: "Георги Петров", avatar: "bear", level: 19, xp: 1890, completed: 12, avgScore: 78, lastActive: "днес" },
  { name: "Ани Димитрова", avatar: "cat", level: 15, xp: 1420, completed: 10, avgScore: 85, lastActive: "вчера" },
  { name: "Виктор Стоянов", avatar: "owl", level: 10, xp: 980, completed: 8, avgScore: 64, lastActive: "преди 3 дни" },
  { name: "Ели Николова", avatar: "panda", level: 7, xp: 640, completed: 6, avgScore: 71, lastActive: "днес" },
  { name: "Калина Тодорова", avatar: "lion", level: 42, xp: 4120, completed: 15, avgScore: 96, lastActive: "днес" },
  { name: "Слави Христов", avatar: "wolf", level: 23, xp: 2210, completed: 13, avgScore: 81, lastActive: "вчера" },
  { name: "Дани Колев", avatar: "tiger", level: 8, xp: 760, completed: 5, avgScore: 55, lastActive: "преди 5 дни" },
];

type Assignment = { id: string; lessonId: string; deadline: string; assignedAt: string };
type TeacherState = { className: string | null; assignments: Assignment[] };

const STORAGE_KEY = "allianz-academy-teacher";

const hasSubmitted = (studentName: string, assignmentId: string) =>
  (studentName.length + assignmentId.length) % 3 !== 0;

function TeacherPortalInner() {
  const params = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  const [ts, setTs] = useState<TeacherState>({ className: null, assignments: [] });
  const [ready, setReady] = useState(false);
  const [classInput, setClassInput] = useState("");
  const [lessonId, setLessonId] = useState(LESSONS[0].id);
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTs(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(ts));
  }, [ts, ready]);

  if (!ready) return null;

  const avgXp = Math.round(STUDENTS.reduce((s, x) => s + x.xp, 0) / STUDENTS.length);
  const avgScore = Math.round(STUDENTS.reduce((s, x) => s + x.avgScore, 0) / STUDENTS.length);
  const activeToday = STUDENTS.filter((s) => s.lastActive === "днес").length;
  const completionRate = Math.round(
    (STUDENTS.reduce((s, x) => s + x.completed, 0) / (STUDENTS.length * LESSONS.length)) * 100
  );

  const addAssignment = () => {
    if (!deadline) return;
    setTs((t) => ({
      ...t,
      assignments: [...t.assignments, { id: `a-${Date.now()}`, lessonId, deadline, assignedAt: new Date().toISOString() }],
    }));
    setDeadline("");
  };

  const exportReport = () => {
    const header = "Ученик,Ниво,Титла,XP,Завършени уроци,Среден резултат %,Последна активност";
    const rows = STUDENTS.map(
      (s) => `${s.name},${s.level},${titleForLevel(s.level)},${s.xp},${s.completed},${s.avgScore},${s.lastActive}`
    );
    const csv = "﻿" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `otchet-${(ts.className || "klas").replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ── Без клас: създаване ──
  if (!ts.className) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-5 pt-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-allianz/10">
            <GraduationCap size={32} className="text-allianz" />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold">Учителски портал</h1>
          <p className="mt-1 text-sm font-medium text-muted">
            Създайте клас, за да задавате домашни и да следите резултатите на учениците.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5">
            <label htmlFor="class-name" className="text-sm font-bold">Име на класа</label>
            <input
              id="class-name"
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              placeholder="напр. 9а — СМГ"
              className="rounded-xl border-2 border-line bg-soft/50 px-4 py-2.5 text-sm font-semibold outline-none transition-colors focus:border-allianz"
            />
            <Button size="lg" disabled={!classInput.trim()} onClick={() => setTs((t) => ({ ...t, className: classInput.trim() }))}>
              <Plus size={16} /> Създай клас
            </Button>
            <p className="text-xs font-medium text-muted">
              Демо: класът се създава с 8 примерни ученици. В продукция учениците се присъединяват с код на класа.
            </p>
          </CardContent>
        </Card>
        <Link href="/" className="text-center text-sm font-bold text-allianz hover:underline">
          <ArrowLeft size={14} className="inline" /> Към приложението
        </Link>
      </div>
    );
  }

  const StatCards = (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        { label: "Среден XP", value: avgXp, icon: "chart" },
        { label: "Среден резултат", value: `${avgScore}%`, icon: "target" },
        { label: "Активни днес", value: `${activeToday} / ${STUDENTS.length}`, icon: "fire" },
        { label: "Завършени уроци", value: `${completionRate}%`, icon: "trophy" },
      ].map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <Thiing name={s.icon} size={36} />
            <div>
              <div className="text-lg font-extrabold tabular-nums">{s.value}</div>
              <div className="text-xs font-semibold text-muted">{s.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const topStudents = [...STUDENTS].sort((a, b) => b.xp - a.xp).slice(0, 3);
  const needAttention = STUDENTS.filter(
    (s) => s.avgScore < 65 || s.lastActive.includes("преди")
  ).sort((a, b) => a.avgScore - b.avgScore);

  const ClassHighlights = (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Топ 3 на класа */}
      <Card className="border-success/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Medal size={18} /> Топ 3 на класа
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {topStudents.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 rounded-xl bg-success/5 px-3 py-2.5">
              <Thiing name={["gold-medal", "silver-medal", "bronze-medal"][i]} size={28} />
              <Thiing name={s.avatar} size={30} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{s.name}</div>
                <div className="text-xs font-semibold text-muted">Ниво {s.level} · {titleForLevel(s.level)}</div>
              </div>
              <div className="text-sm font-extrabold tabular-nums">{s.xp} XP</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ученици, нуждаещи се от внимание */}
      <Card className="border-warning/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle size={18} /> Нуждаят се от внимание
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {needAttention.length === 0 ? (
            <p className="rounded-xl bg-soft/60 p-4 text-sm font-medium text-muted">
              Всички ученици са активни и с добри резултати — браво на класа!
            </p>
          ) : (
            needAttention.map((s) => (
              <div key={s.name} className="flex items-center gap-3 rounded-xl bg-warning/5 px-3 py-2.5">
                <Thiing name={s.avatar} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{s.name}</div>
                  <div className="text-xs font-semibold text-muted">
                    {s.avgScore < 65 ? `среден резултат ${s.avgScore}%` : "ниска активност"} · активен {s.lastActive}
                  </div>
                </div>
                <Badge tone="orange">{s.avgScore}%</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Идеи за час по темите от платформата
  const CLASS_IDEAS = [
    { icon: "sword", title: "Куиз турнир", text: "Разделете класа на отбори и направете дуел на живо — въпросите от урока на дъската, отборите отговарят за време." },
    { icon: "basket", title: "Бюджет на екскурзията", text: "Реален казус: планирайте заедно бюджета на класната екскурзия — транспорт, храна, резерв за непредвидени разходи." },
    { icon: "padlock", title: "Разпознай измамата", text: "Покажете 3 съобщения (2 фишинг, 1 истинско) и оставете класът да гласува и аргументира кое е какво." },
  ];

  const ClassIdeas = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb size={18} className="text-allianz" /> Идеи за час
        </CardTitle>
        <p className="text-sm font-medium text-muted">Готови активности, свързани с уроците в платформата</p>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-3">
        {CLASS_IDEAS.map((idea) => (
          <div key={idea.title} className="flex flex-col gap-2 rounded-xl bg-soft/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Thiing name={idea.icon} size={30} />
              <span className="text-sm font-bold">{idea.title}</span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-muted">{idea.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const ResultsTable = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users2 size={18} className="text-allianz" /> Резултати на учениците
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-extrabold uppercase tracking-wide text-muted">
                <th className="pb-2 pr-3">Ученик</th>
                <th className="pb-2 pr-3">Ниво</th>
                <th className="pb-2 pr-3">XP</th>
                <th className="pb-2 pr-3">Уроци</th>
                <th className="pb-2 pr-3">Среден резултат</th>
                <th className="pb-2">Активност</th>
              </tr>
            </thead>
            <tbody>
              {[...STUDENTS].sort((a, b) => b.xp - a.xp).map((s) => (
                <tr key={s.name} className="border-b border-line/50">
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2 font-bold">
                      <Thiing name={s.avatar} size={26} /> {s.name}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-semibold tabular-nums">{s.level}</td>
                  <td className="py-2.5 pr-3 font-semibold tabular-nums">{s.xp}</td>
                  <td className="py-2.5 pr-3 font-semibold tabular-nums">{s.completed} / {LESSONS.length}</td>
                  <td className="py-2.5 pr-3">
                    <Badge tone={s.avgScore >= 80 ? "green" : s.avgScore >= 60 ? "blue" : "orange"}>{s.avgScore}%</Badge>
                  </td>
                  <td className="py-2.5">
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted">
                      {s.lastActive === "днес" && <CheckCircle2 size={13} className="text-success" />}
                      {s.lastActive}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Заглавие на класа */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-allianz">
            <GraduationCap size={14} /> Учителски портал
          </div>
          <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">Клас {ts.className}</h1>
          <p className="text-sm font-medium text-muted">{STUDENTS.length} ученици</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportReport}>
          <Download size={15} /> Експорт (CSV)
        </Button>
      </div>

      <PortalTabs base="/teacher" />

      {/* ── Обзор ── */}
      {tab === "overview" && (
        <div className="flex flex-col gap-5">
          {StatCards}
          {ClassHighlights}
          {ResultsTable}
          {ClassIdeas}
        </div>
      )}

      {/* ── Домашни ── */}
      {tab === "homework" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={18} className="text-allianz" /> Домашни
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-2 rounded-xl bg-soft/50 p-3">
              <div className="min-w-40 flex-1">
                <label htmlFor="hw-lesson" className="mb-1 block text-xs font-bold text-muted">Урок</label>
                <select
                  id="hw-lesson"
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  className="w-full rounded-xl border-2 border-line bg-card px-3 py-2 text-sm font-semibold outline-none focus:border-allianz"
                >
                  {WORLDS.map((w) => (
                    <optgroup key={w.id} label={`Свят ${w.id}: ${w.name}`}>
                      {LESSONS.filter((l) => l.worldId === w.id).map((l) => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="hw-deadline" className="mb-1 block text-xs font-bold text-muted">Срок</label>
                <input
                  id="hw-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="rounded-xl border-2 border-line bg-card px-3 py-2 text-sm font-semibold outline-none focus:border-allianz"
                />
              </div>
              <Button onClick={addAssignment} disabled={!deadline}>
                <Plus size={15} /> Задай
              </Button>
            </div>

            {ts.assignments.length === 0 ? (
              <p className="rounded-xl bg-soft/60 p-4 text-center text-sm font-medium text-muted">
                Още няма зададени домашни — изберете урок и срок по-горе.
              </p>
            ) : (
              <div className="grid gap-2 lg:grid-cols-2">
                {ts.assignments.map((a) => {
                  const lesson = LESSONS.find((l) => l.id === a.lessonId);
                  if (!lesson) return null;
                  const submitted = STUDENTS.filter((s) => hasSubmitted(s.name, a.id)).length;
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl border border-line/60 px-3 py-2.5">
                      <Thiing name={lesson.icon} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{lesson.title}</div>
                        <div className="text-xs font-semibold text-muted">
                          Срок: {new Date(a.deadline).toLocaleDateString("bg-BG")}
                        </div>
                      </div>
                      <div className="hidden w-32 items-center gap-2 sm:flex">
                        <Progress value={(submitted / STUDENTS.length) * 100} className="h-2 flex-1" />
                        <span className="text-xs font-bold text-muted tabular-nums">{submitted}/{STUDENTS.length}</span>
                      </div>
                      <button
                        aria-label="Премахни домашното"
                        onClick={() => setTs((t) => ({ ...t, assignments: t.assignments.filter((x) => x.id !== a.id) }))}
                        className="rounded-full p-2 text-muted transition-colors cursor-pointer hover:text-danger"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Резултати ── */}
      {tab === "results" && (
        <div className="flex flex-col gap-5">
          {ResultsTable}
          {ClassHighlights}
        </div>
      )}

      {/* ── Отчети ── */}
      {tab === "reports" && (
        <div className="flex flex-col gap-5">
          {StatCards}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-allianz" /> Експорт на отчет
              </CardTitle>
              <p className="text-sm font-medium text-muted">
                Свали резултатите на класа като CSV файл — отваря се директно в Excel или Google Sheets.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-xl bg-soft/50 p-4 text-sm font-medium text-muted">
                Отчетът съдържа за всеки от {STUDENTS.length} ученици: име, ниво, титла, XP, завършени уроци,
                среден резултат и последна активност.
              </div>
              <Button size="lg" onClick={exportReport} className="self-start">
                <Download size={16} /> Свали отчет за клас {ts.className}
              </Button>
            </CardContent>
          </Card>

          {/* Готово резюме за родителска среща */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Presentation size={18} className="text-allianz" /> Резюме за родителска среща
              </CardTitle>
              <p className="text-sm font-medium text-muted">Ключовите числа на класа, готови за представяне</p>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {[
                `Класът е завършил ${completionRate}% от всички уроци при среден резултат ${avgScore}%.`,
                `${activeToday} от ${STUDENTS.length} ученици са били активни днес — навикът се изгражда.`,
                `Най-силно представяне: ${topStudents[0].name} (${topStudents[0].xp} XP, среден резултат ${topStudents[0].avgScore}%).`,
                needAttention.length > 0
                  ? `${needAttention.length} ${needAttention.length === 1 ? "ученик се нуждае" : "ученици се нуждаят"} от допълнителна подкрепа — вижте таб „Резултати“.`
                  : "Няма ученици с рискови резултати — целият клас се движи стабилно.",
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-soft/50 px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-allianz text-xs font-extrabold text-white tabular-nums">
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">{line}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TeacherPortal() {
  return (
    <Suspense fallback={null}>
      <TeacherPortalInner />
    </Suspense>
  );
}
