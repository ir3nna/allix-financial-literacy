"use client";

// Поток на урока: История → Концепция → Интеракция → Куиз → Награда
// XP логика: базова награда + 50 XP бонус при перфектен куиз; повторение дава половин XP.

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, BookOpen, Lightbulb, Gamepad2, HelpCircle, Trophy, Heart, Check, Sparkles, Rocket, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useGame } from "@/lib/game-state";
import { LESSONS, WORLDS, BADGES, levelFromXp, gradeLevelInfo } from "@/lib/data";
import { FINI_ENCOURAGEMENTS, FINI_PRAISE, randomFrom } from "@/lib/fini";
import { iqFromState, iqTitle } from "@/lib/iq";
import { FiniBubble } from "@/components/fini";
import { Thiing } from "@/components/thiing";
import { cn } from "@/lib/utils";

type Step = "story" | "concept" | "interaction" | "quiz" | "reward";
const STEPS: Step[] = ["story", "concept", "interaction", "quiz", "reward"];
const STEP_META: Record<Step, { label: string; icon: React.ElementType }> = {
  story: { label: "История", icon: BookOpen },
  concept: { label: "Концепция", icon: Lightbulb },
  interaction: { label: "Играй", icon: Gamepad2 },
  quiz: { label: "Куиз", icon: HelpCircle },
  reward: { label: "Награда", icon: Trophy },
};

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const router = useRouter();
  const { state, completeLesson, toggleFavorite, ready } = useGame();

  const lesson = useMemo(() => LESSONS.find((l) => l.id === lessonId), [lessonId]);
  const world = lesson ? WORLDS.find((w) => w.id === lesson.worldId) : null;

  const [step, setStep] = useState<Step>("story");
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [sliderChecked, setSliderChecked] = useState(false);
  const [choicePicked, setChoicePicked] = useState<number | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [wrongFirstTry, setWrongFirstTry] = useState<number | null>(null); // сгрешен първи опит (за втория шанс от Фини)
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [finiLine, setFiniLine] = useState("");
  const [result, setResult] = useState<{ xp: number; leveledUp: boolean; newBadge: string | null; score: number; iqBefore: number } | null>(null);

  if (!ready) return null;
  if (!lesson || !world) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Урокът не е намерен</p>
        <Link href="/learn" className="text-allianz hover:underline">Обратно към картата</Link>
      </div>
    );
  }

  const stepIndex = STEPS.indexOf(step);
  const question = lesson.quiz[quizIndex];

  const goNext = () => {
    if (step === "quiz") {
      if (quizIndex < lesson.quiz.length - 1) {
        setQuizIndex((i) => i + 1);
        setQuizAnswer(null);
        setWrongFirstTry(null);
        return;
      }
      // Куизът приключи → изчисли резултата и запиши прогреса.
      // Точка се брои и при втори опит, но „перфектен“ бонус има само без грешки от първия път.
      const score = Math.round((totalCorrect / lesson.quiz.length) * 100);
      const perfect = firstTryCorrect === lesson.quiz.length;
      const alreadyDone = !!state.progress[lesson.id];
      const baseXp = lesson.xpReward + 25 + (perfect ? 50 : 0); // урок + куиз + бонус за перфектен
      const iqBefore = iqFromState(state);
      const { leveledUp, newBadge } = completeLesson(lesson.id, perfect ? 100 : score, baseXp, lesson.badgeId);
      setResult({ xp: alreadyDone ? Math.round(baseXp / 2) : baseXp, leveledUp, newBadge, score, iqBefore });
      setStep("reward");
      return;
    }
    setStep(STEPS[stepIndex + 1]);
  };

  const answerQuiz = (idx: number) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    if (idx === question.correct) {
      setTotalCorrect((c) => c + 1);
      if (wrongFirstTry === null) setFirstTryCorrect((c) => c + 1);
      setFiniLine(randomFrom(FINI_PRAISE));
    } else {
      setFiniLine(wrongFirstTry === null ? FINI_ENCOURAGEMENTS[0] : randomFrom(FINI_ENCOURAGEMENTS.slice(1)));
    }
  };

  // Втори шанс от Фини: скрива сгрешения отговор и пуска нов опит
  const retryQuestion = () => {
    setWrongFirstTry(quizAnswer);
    setQuizAnswer(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {/* Заглавна лента с прогрес */}
      <div className="flex items-center gap-3">
        <Link href="/learn" className="rounded-full p-2 text-muted hover:bg-soft">
          <X size={20} />
        </Link>
        <div className="flex-1">
          <div className="text-xs font-semibold text-muted">{world.name}</div>
          <div className="font-bold leading-tight">{lesson.title}</div>
        </div>
        <button
          aria-label={state.favorites.includes(lesson.id) ? "Премахни от любими" : "Добави в любими"}
          onClick={() => toggleFavorite(lesson.id)}
          className="rounded-full p-2 transition-transform cursor-pointer hover:scale-125"
        >
          <Heart
            size={20}
            className={state.favorites.includes(lesson.id) ? "fill-danger text-danger animate-pop" : "text-muted/60"}
          />
        </button>
        <span className="text-xs font-semibold tabular-nums text-muted">
          {stepIndex + 1} / {STEPS.length}
        </span>
      </div>
      <Progress value={((stepIndex + (step === "quiz" ? quizIndex / lesson.quiz.length : 0)) / (STEPS.length - 1)) * 100} />

      {/* Индикатор на стъпките */}
      <div className="flex justify-between px-1">
        {STEPS.map((s, i) => {
          const Icon = STEP_META[s].icon;
          return (
            <div
              key={s}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-semibold",
                i <= stepIndex ? "text-allianz" : "text-muted/50"
              )}
            >
              <Icon size={18} />
              {STEP_META[s].label}
            </div>
          );
        })}
      </div>

      <motion.div
        key={step + quizIndex}
        initial={{ x: 30 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.25 }}
      >
          {/* ── История ── */}
          {step === "story" && (
            <Card className="overflow-hidden">
              {/* Илюстрация на урока */}
              <div
                className="relative flex h-44 items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${world.color}, color-mix(in srgb, ${world.color} 60%, #0a1030))`,
                }}
              >
                <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
                <span className="pointer-events-none absolute left-6 top-6 opacity-40 animate-float-slow select-none">
                  <Thiing name={world.icon} size={44} />
                </span>
                <Sparkles className="pointer-events-none absolute right-8 bottom-5 text-white/50 animate-float" size={26} />
                <span className="animate-float drop-shadow-lg select-none">
                  <Thiing name={lesson.icon} size={110} />
                </span>
              </div>
              <CardContent className="pt-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-allianz/10 px-3 py-1 text-xs font-bold text-allianz">
                  <BookOpen size={14} /> История
                </div>
                <p className="text-lg leading-relaxed text-fg/90">{lesson.story}</p>
                <Button className="mt-6 w-full" size="lg" onClick={goNext}>
                  Продължи
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Концепция (адаптирана към нивото по клас) ── */}
          {step === "concept" && (() => {
            const lvl = gradeLevelInfo(state.gradeLevel);
            const adapted = lesson.levelConcepts?.[state.gradeLevel];
            const concept = adapted ?? lesson.concept;
            return (
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-xs font-bold text-amber-700">
                      <Lightbulb size={14} /> Ключова идея
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-allianz/10 px-3 py-1 text-xs font-bold text-allianz">
                      {lvl.label} · {lvl.grade}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{concept.title}</h2>
                  <p className="mt-3 leading-relaxed text-fg/80">{concept.text}</p>
                  {adapted && (
                    <p className="mt-3 text-xs font-medium text-muted">
                      Съдържанието е представено за твоето ниво ({lvl.math}). Смени нивото си от профила.
                    </p>
                  )}
                  <Button className="mt-6 w-full" size="lg" onClick={goNext}>
                    Разбрах, давай нататък!
                  </Button>
                </CardContent>
              </Card>
            );
          })()}

          {/* ── Интеракция ── */}
          {step === "interaction" && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-allianz/10 px-3 py-1 text-xs font-bold text-allianz">
                  <Gamepad2 size={14} /> Твой ход
                </div>
                <h2 className="text-lg font-bold">{lesson.interaction.prompt}</h2>

                {lesson.interaction.type === "slider" && (
                  <div className="mt-6">
                    <input
                      type="range"
                      min={lesson.interaction.min}
                      max={lesson.interaction.max}
                      step={lesson.interaction.step}
                      value={sliderValue ?? lesson.interaction.min}
                      onChange={(e) => {
                        setSliderValue(Number(e.target.value));
                        setSliderChecked(false);
                      }}
                      className="w-full accent-[#0057FF]"
                    />
                    <div className="mt-2 text-center text-2xl font-bold tabular-nums text-allianz">
                      {sliderValue ?? lesson.interaction.min} {lesson.interaction.unit}
                    </div>
                    {sliderChecked && sliderValue !== null && (
                      <motion.p
                        initial={{ y: 6 }}
                        animate={{ y: 0 }}
                        className="mt-4 rounded-xl bg-soft/60 p-4 text-sm font-medium text-fg/90"
                      >
                        {lesson.interaction.feedback(sliderValue)}
                      </motion.p>
                    )}
                    <div className="mt-5 flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSliderChecked(true)}
                        disabled={sliderValue === null}
                      >
                        Провери
                      </Button>
                      <Button className="flex-1" onClick={goNext} disabled={!sliderChecked}>
                        Към куиза
                      </Button>
                    </div>
                  </div>
                )}

                {lesson.interaction.type === "choice" && (
                  <div className="mt-5 flex flex-col gap-3">
                    {lesson.interaction.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setChoicePicked(i)}
                        className={cn(
                          "rounded-xl border-2 p-4 text-left text-sm font-semibold transition-all cursor-pointer",
                          choicePicked === null
                            ? "border-line hover:border-allianz/50"
                            : choicePicked === i
                            ? opt.good
                              ? "border-success bg-success/5"
                              : "border-warning bg-warning/5"
                            : "border-line/60 opacity-50"
                        )}
                      >
                        {opt.label}
                        {choicePicked === i && (
                          <motion.p
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="mt-2 text-xs font-medium text-fg/80"
                          >
                            {opt.feedback}
                          </motion.p>
                        )}
                      </button>
                    ))}
                    <Button className="mt-2" size="lg" onClick={goNext} disabled={choicePicked === null}>
                      Към куиза
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Куиз ── */}
          {step === "quiz" && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-allianz/10 px-3 py-1 text-xs font-bold text-allianz">
                    <HelpCircle size={14} /> Въпрос {quizIndex + 1} от {lesson.quiz.length}
                  </div>
                  <span className="text-xs font-semibold text-muted">Перфектен куиз = +50 XP бонус</span>
                </div>
                <h2 className="text-lg font-bold">{question.question}</h2>
                <div className="mt-5 flex flex-col gap-3">
                  {question.options.map((opt, i) => {
                    const answered = quizAnswer !== null;
                    const isCorrect = i === question.correct;
                    const isPicked = quizAnswer === i;
                    const eliminated = wrongFirstTry === i && !answered; // скрит от Фини след грешен първи опит
                    return (
                      <button
                        key={i}
                        onClick={() => answerQuiz(i)}
                        disabled={answered || eliminated}
                        className={cn(
                          "rounded-xl border-2 p-4 text-left text-sm font-semibold transition-all cursor-pointer disabled:cursor-default",
                          !answered && !eliminated && "border-line hover:border-allianz/50",
                          eliminated && "border-danger/40 bg-danger/5 opacity-40 line-through",
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

                {/* Подсказка от Фини при активен втори опит */}
                {quizAnswer === null && wrongFirstTry !== null && (
                  <div className="mt-4">
                    <FiniBubble tone="warn">
                      {finiLine} Задрасках грешния отговор — помисли кой от останалите пасва на урока.
                    </FiniBubble>
                  </div>
                )}

                {quizAnswer !== null && (
                  <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="mt-4 flex flex-col gap-3">
                    {quizAnswer === question.correct ? (
                      <FiniBubble tone="success">
                        {finiLine} {question.explanation}
                      </FiniBubble>
                    ) : wrongFirstTry === null ? (
                      <FiniBubble tone="warn">{finiLine}</FiniBubble>
                    ) : (
                      <FiniBubble tone="info">
                        {finiLine} Верният отговор е отбелязан в зелено — запомни: {question.explanation}
                      </FiniBubble>
                    )}

                    {quizAnswer !== question.correct && wrongFirstTry === null ? (
                      <Button className="w-full" size="lg" onClick={retryQuestion}>
                        Опитай пак с подсказка
                      </Button>
                    ) : (
                      <Button className="w-full" size="lg" onClick={goNext}>
                        {quizIndex < lesson.quiz.length - 1 ? "Следващ въпрос" : "Виж наградата"}
                      </Button>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Награда ── */}
          {step === "reward" && result && (
            <Card className="overflow-hidden">
              <CardContent className="pt-8 text-center">
                <motion.div
                  initial={{ scale: 0.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="flex justify-center"
                >
                  <Thiing name={result.score === 100 ? "trophy" : result.score >= 50 ? "confetti" : "dumbbell"} size={96} />
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold">
                  {result.score === 100 ? "Перфектно!" : result.score >= 50 ? "Браво!" : "Добър опит!"}
                </h2>
                <p className="mt-1 text-muted">
                  Резултат от куиза: <span className="font-bold tabular-nums">{result.score}%</span>
                </p>

                <motion.div
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-allianz/10 px-5 py-2.5 text-lg font-bold text-allianz tabular-nums"
                >
                  <Star size={18} fill="currentColor" /> +{result.xp} XP
                </motion.div>

                {/* Финансов IQ след урока */}
                {(() => {
                  const iqNow = iqFromState(state);
                  const delta = iqNow - result.iqBefore;
                  return (
                    <motion.div
                      initial={{ y: 10 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="mx-auto mt-3 flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-soft/50 p-4 text-left"
                    >
                      <Thiing name="brain" size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold uppercase tracking-wide text-muted">Финансов IQ</div>
                        <div className="text-xl font-extrabold tabular-nums">
                          {iqNow} <span className="text-sm font-bold text-muted">/ 1000</span>
                          {delta > 0 && <span className="ml-2 text-sm font-extrabold text-success">+{delta}</span>}
                        </div>
                        <div className="text-xs font-bold text-allianz">{iqTitle(iqNow)}</div>
                      </div>
                    </motion.div>
                  );
                })()}

                {result.leveledUp && (
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 rounded-xl bg-warning/10 p-3 font-bold text-amber-700"
                  >
                    <Rocket size={16} className="mr-1 inline" /> НОВО НИВО! Вече си ниво {levelFromXp(state.xp)}!
                  </motion.p>
                )}

                {result.newBadge && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-4 rounded-xl bg-success/10 p-3"
                  >
                    <span className="flex justify-center"><Thiing name={BADGES.find((b) => b.id === result.newBadge)?.icon ?? "trophy"} size={44} /></span>
                    <p className="font-bold text-green-700">
                      Нова значка: {BADGES.find((b) => b.id === result.newBadge)?.name}!
                    </p>
                  </motion.div>
                )}

                <div className="mt-7 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => router.push("/learn")}>
                    Към картата
                  </Button>
                  <Button className="flex-1" onClick={() => router.push("/")}>
                    Начало
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
      </motion.div>
    </div>
  );
}
