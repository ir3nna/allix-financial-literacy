// Финансов IQ — индекс 0–1000, изчисляван от целия прогрес на ученика.
// Расте след всеки урок, куиз, дуел, практическа мисия и дневно предизвикателство.

import { LESSONS, PRACTICAL_MISSIONS } from "./data";
import type { GameState } from "./game-state";

// Тежести (общо 1000): уроци 400 · среден резултат 250 · перфектни куизове 100
// · дуели 100 · практически мисии 100 · дневни предизвикателства 50
export function iqFromState(s: GameState): number {
  const done = Object.values(s.progress);
  const completed = done.length;
  const avgScore = completed ? done.reduce((sum, p) => sum + p.score, 0) / completed : 0;

  const lessonPts = (completed / LESSONS.length) * 400;
  const scorePts = (avgScore / 100) * 250;
  const perfectPts = Math.min(1, s.perfectQuizzes / LESSONS.length) * 100;
  const duelPts = s.duelsPlayed ? (s.duelsWon / s.duelsPlayed) * 100 : 0;
  const practicalPts = (Object.keys(s.practical).length / PRACTICAL_MISSIONS.length) * 100;
  const dailyPts = Math.min(50, s.dailyCorrectCount * 5);

  return Math.min(1000, Math.round(lessonPts + scorePts + perfectPts + duelPts + practicalPts + dailyPts));
}

export function iqTitle(iq: number): string {
  if (iq >= 900) return "Финансов гений";
  if (iq >= 800) return "Финансов експерт";
  if (iq >= 600) return "Финансов стратег";
  if (iq >= 400) return "Финансово грамотен";
  if (iq >= 200) return "Любопитен ум";
  return "Финансов новак";
}
