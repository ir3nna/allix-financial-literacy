"use client";

// Дуели: предизвикай съученик или Фин-бот (AI) на куиз битка за XP.
// Опонентът е симулиран — отговаря вярно с вероятност според нивото/трудността си.
// При Supabase интеграция съученическите дуели стават реални (realtime канали).

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swords, Timer, Bot, Users, Sparkles, Trophy, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/lib/game-state";
import { FiniBubble } from "@/components/fini";
import { Thiing } from "@/components/thiing";
import {
  AI_OPPONENTS,
  LEADERBOARD,
  BADGES,
  getDuelQuestions,
  recommendedAiFor,
  classmateAccuracy,
  titleForLevel,
  type QuizQuestion,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const QUESTION_COUNT = 5;
const SECONDS_PER_QUESTION = 15;

// XP награди според изхода
const XP_LOSS = 25;
const XP_DRAW = 50;
const XP_WIN_CLASSMATE = 100;

type Opponent = {
  name: string;
  avatar: string;
  subtitle: string;
  accuracy: number;
  winXp: number;
};

type Phase = "lobby" | "battle" | "result";

export default function DuelPage() {
  const { state, level, recordDuel, ready } = useGame();

  const [phase, setPhase] = useState<Phase>("lobby");
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null); // -1 = изтекло време
  const [oppCorrect, setOppCorrect] = useState<boolean | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [outcome, setOutcome] = useState<{
    xp: number;
    won: boolean;
    draw: boolean;
    leveledUp: boolean;
    newBadge: string | null;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recommended = useMemo(() => recommendedAiFor(level), [level]);
  const question = questions[qIndex];
  const answered = answer !== null;

  // Таймер на въпроса
  useEffect(() => {
    if (phase !== "battle" || answered) return;
    setSecondsLeft(SECONDS_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          submitAnswer(-1); // времето изтече → грешен отговор
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIndex]);

  const startDuel = (opp: Opponent) => {
    setOpponent(opp);
    setQuestions(getDuelQuestions(level, QUESTION_COUNT));
    setQIndex(0);
    setMyScore(0);
    setOppScore(0);
    setAnswer(null);
    setOppCorrect(null);
    setOutcome(null);
    setPhase("battle");
  };

  const submitAnswer = (idx: number) => {
    if (answer !== null || !question || !opponent) return;
    clearInterval(timerRef.current!);
    setAnswer(idx);
    const meCorrect = idx === question.correct;
    const botCorrect = Math.random() < opponent.accuracy;
    setOppCorrect(botCorrect);
    if (meCorrect) setMyScore((s) => s + 1);
    if (botCorrect) setOppScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setAnswer(null);
      setOppCorrect(null);
      return;
    }
    // Край на дуела
    const won = myScore > oppScore;
    const draw = myScore === oppScore;
    const xp = won ? opponent!.winXp : draw ? XP_DRAW : XP_LOSS;
    const { leveledUp, newBadge } = recordDuel(won, xp);
    setOutcome({ xp, won, draw, leveledUp, newBadge });
    setPhase("result");
  };

  if (!ready) return null;

  // ─── Лоби ───
  if (phase === "lobby") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold md:text-3xl">
              <Swords size={26} className="text-allianz" /> Дуели
            </h1>
            <p className="text-sm font-medium text-muted">
              Куиз битка 1 срещу 1 — {QUESTION_COUNT} въпроса, {SECONDS_PER_QUESTION} сек. на въпрос
            </p>
          </div>
          <Badge tone="blue" className="text-sm py-1.5 px-3 tabular-nums">
            <Trophy size={14} /> {state.duelsWon} / {state.duelsPlayed} победи
          </Badge>
        </div>

        {/* AI опоненти */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot size={18} className="text-allianz" /> Симулатор с AI
            </CardTitle>
            <p className="text-sm font-medium text-muted">
              AI играе роля — скептичен клиент, продавач или консултант. Упражняваш решението си, а не се състезаваш срещу бота; оценката остава при учителя.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {AI_OPPONENTS.map((ai) => {
              const isRecommended = ai.id === recommended.id;
              const diffColor = ai.difficulty === "easy" ? "#22C55E" : ai.difficulty === "medium" ? "#F59E0B" : "#EF4444";
              return (
                <div
                  key={ai.id}
                  className={cn(
                    "flex flex-col rounded-2xl border-2 p-4",
                    isRecommended ? "border-allianz/50" : "border-line"
                  )}
                  style={{ background: `linear-gradient(150deg, ${diffColor}12, transparent 60%)` }}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(isRecommended && "animate-float")}><Thiing name={ai.avatar} size={44} /></span>
                    {isRecommended && (
                      <Badge tone="blue">
                        <Sparkles size={12} /> За твоето ниво
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 font-bold">{ai.name}</div>
                  <div className="text-xs font-semibold text-muted">
                    {ai.difficultyLabel} · ниво {ai.minLevel}–{ai.maxLevel}
                  </div>
                  <p className="mt-1.5 flex-1 text-xs font-medium leading-relaxed text-muted">
                    {ai.tagline}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-allianz tabular-nums">+{ai.winXp} XP</span>
                    <Button
                      size="sm"
                      variant={isRecommended ? "primary" : "outline"}
                      onClick={() =>
                        startDuel({
                          name: ai.name,
                          avatar: ai.avatar,
                          subtitle: `${ai.difficultyLabel} бот`,
                          accuracy: ai.accuracy,
                          winXp: ai.winXp,
                        })
                      }
                    >
                      <Swords size={14} /> Дуел
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Съученици */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} className="text-allianz" /> Предизвикай съученик
            </CardTitle>
            <p className="text-sm font-medium text-muted">
              Победа срещу съученик носи +{XP_WIN_CLASSMATE} XP
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {LEADERBOARD.class.map((mate) => (
              <div
                key={mate.name}
                className="flex items-center gap-3 rounded-xl border border-line/60 bg-soft/40 px-3 py-2.5"
              >
                <Thiing name={mate.avatar} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{mate.name}</div>
                  <div className="text-xs font-semibold text-muted">
                    Ниво {mate.level} · {titleForLevel(mate.level)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    startDuel({
                      name: mate.name,
                      avatar: mate.avatar,
                      subtitle: `Ниво ${mate.level}`,
                      accuracy: classmateAccuracy(mate.level),
                      winXp: XP_WIN_CLASSMATE,
                    })
                  }
                >
                  <Swords size={14} /> Предизвикай
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Твоят рекорд */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size={18} className="text-allianz" /> Твоят рекорд
            </CardTitle>
            <p className="text-sm font-medium text-muted">
              Всеки дуел трупа XP — дори загубата носи точки за смелост.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Победи", value: String(state.duelsWon), tone: "text-success" },
              { label: "Изиграни", value: String(state.duelsPlayed) },
              {
                label: "Успеваемост",
                value: state.duelsPlayed ? `${Math.round((state.duelsWon / state.duelsPlayed) * 100)}%` : "—",
              },
              { label: "XP при победа", value: `+${recommended.winXp}`, tone: "text-allianz" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-line/60 bg-soft/40 p-4 text-center">
                <div className={cn("text-2xl font-extrabold tabular-nums", s.tone)}>{s.value}</div>
                <div className="mt-0.5 text-xs font-semibold text-muted">{s.label}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Как протича дуелът */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords size={18} className="text-allianz" /> Как протича дуелът
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: `${QUESTION_COUNT} въпроса`, text: "Един и същ куиз за теб и опонента — печели повече верни отговори." },
              { icon: Timer, title: `${SECONDS_PER_QUESTION} секунди`, text: "Толкова имаш на въпрос. Бързай, но не прибързвай — точността е ключът." },
              { icon: Trophy, title: "Повече верни печели", text: "Победа = пълно XP, равен = половин, загуба = XP за участие. Всичко брои." },
            ].map((s) => (
              <div key={s.title} className="flex gap-3 rounded-2xl border border-line/60 bg-soft/40 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-allianz/10 text-allianz">
                  <s.icon size={20} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold">{s.title}</div>
                  <p className="mt-0.5 text-xs font-medium leading-relaxed text-muted">{s.text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Съвети от Аликс */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={18} className="text-allianz" /> Съвети от Аликс
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FiniBubble>
              Чети внимателно, но бързо — таймерът тече. По-добре верен отговор на 12-та секунда, отколкото прибързан на 3-та.
            </FiniBubble>
            <FiniBubble tone="success">
              Загубиш ли — пак взимаш XP. Играй смело: всеки дуел те прави по-добър и качва класа ти нагоре.
            </FiniBubble>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Битка ───
  if (phase === "battle" && question && opponent) {
    return (
      <div className="flex w-full flex-col gap-4">
        {/* Резултат на живо */}
        <Card>
          <CardContent className="flex items-center justify-between pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Thiing name={state.avatar} size={44} />
              <div>
                <div className="text-sm font-bold">{state.name}</div>
                <div className="text-2xl font-extrabold text-allianz tabular-nums">{myScore}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Въпрос</div>
              <div className="font-extrabold tabular-nums">
                {qIndex + 1} / {questions.length}
              </div>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-sm font-bold">{opponent.name}</div>
                <div className="text-2xl font-extrabold text-danger tabular-nums">{oppScore}</div>
              </div>
              <Thiing name={opponent.avatar} size={44} />
            </div>
          </CardContent>
        </Card>

        {/* Таймер */}
        <div className="flex items-center gap-3">
          <Timer size={18} className={secondsLeft <= 5 ? "text-danger" : "text-muted"} />
          <Progress
            value={(secondsLeft / SECONDS_PER_QUESTION) * 100}
            className="h-2 flex-1"
            barClassName={secondsLeft <= 5 ? "bg-danger" : undefined}
          />
          <span
            className={cn(
              "w-8 text-right text-sm font-extrabold tabular-nums",
              secondsLeft <= 5 ? "text-danger" : "text-muted"
            )}
          >
            {secondsLeft}
          </span>
        </div>

        {/* Въпрос */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold">{question.question}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {question.options.map((opt, i) => {
                const isCorrect = i === question.correct;
                const isPicked = answer === i;
                return (
                  <button
                    key={i}
                    onClick={() => submitAnswer(i)}
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
                    {answered && isCorrect && <Check size={16} className="ml-2 inline text-success" strokeWidth={3} />}
                    {answered && isPicked && !isCorrect && <X size={16} className="ml-2 inline text-danger" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="mt-4">
                {answer === -1 && (
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-danger"><Timer size={15} /> Времето изтече!</p>
                )}
                <p
                  className={cn(
                    "rounded-xl p-3 text-sm font-semibold",
                    oppCorrect ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                  )}
                >
                  <Thiing name={opponent.avatar} size={20} className="mr-1 inline-block align-text-bottom" /> {opponent.name} {oppCorrect ? "отговори вярно (+1)" : "сбърка"}
                </p>
                <Button className="mt-4 w-full" size="lg" onClick={nextQuestion}>
                  {qIndex < questions.length - 1 ? "Следващ въпрос" : "Виж резултата"}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Резултат ───
  if (phase === "result" && outcome && opponent) {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent className="pt-8 text-center">
          <motion.div
            initial={{ scale: 0.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="flex justify-center"
          >
            <Thiing name={outcome.won ? "trophy" : outcome.draw ? "handshake" : "dumbbell"} size={96} />
          </motion.div>
          <h2 className="mt-4 text-2xl font-extrabold">
            {outcome.won ? "Победа!" : outcome.draw ? "Равенство!" : "Загуба... този път"}
          </h2>
          <p className="mt-2 flex items-center justify-center gap-2 text-lg font-bold tabular-nums">
            <Thiing name={state.avatar} size={28} /> {myScore} : {oppScore} <Thiing name={opponent.avatar} size={28} />
          </p>
          <p className="text-sm font-medium text-muted">срещу {opponent.name}</p>

          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-allianz/10 px-5 py-2.5 text-lg font-bold text-allianz tabular-nums"
          >
            ⭐ +{outcome.xp} XP
          </motion.div>

          {outcome.leveledUp && (
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 rounded-xl bg-warning/10 p-3 font-bold text-amber-700 dark:text-amber-400"
            >
              НОВО НИВО!
            </motion.p>
          )}

          {outcome.newBadge && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 rounded-xl bg-success/10 p-3"
            >
              <span className="flex justify-center"><Thiing name={BADGES.find((b) => b.id === outcome.newBadge)?.icon ?? "trophy"} size={44} /></span>
              <p className="font-bold text-green-700 dark:text-green-400">
                Нова значка: {BADGES.find((b) => b.id === outcome.newBadge)?.name}!
              </p>
            </motion.div>
          )}

          {!outcome.won && !outcome.draw && (
            <div className="mt-4 text-left">
              <FiniBubble tone="warn">
                Не се притеснявай. Нека опитаме по друг начин — премини още някой урок и ела за реванш. Ще се справиш!
              </FiniBubble>
            </div>
          )}

          <div className="mt-7 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => startDuel(opponent)}>
              <Swords size={15} /> Реванш
            </Button>
            <Button className="flex-1" onClick={() => setPhase("lobby")}>
              Към дуелите
            </Button>
          </div>
          <Link href="/" className="mt-3 inline-block text-sm font-bold text-allianz hover:underline">
            Начало
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
}
