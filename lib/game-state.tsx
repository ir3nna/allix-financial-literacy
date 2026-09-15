"use client";

// Игрово състояние на ученика — XP, ниво, серия, значки, прогрес по уроци + настройки (тема, акцент).
// Пази се в localStorage; при интеграция със Supabase се замества с таблиците users/progress/user_badges.

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { levelFromXp } from "./data";

export type LessonProgress = {
  status: "completed";
  score: number; // % верни отговори на куиза
  perfect: boolean;
  completedAt: string;
};

export type Theme = "light" | "dark" | "system";
export type Accent = "blue" | "green" | "purple" | "orange";
// Ниво на съдържанието по клас (определя се от математиката на ученика)
export type GradeLevel = "A" | "B" | "V";

export type GameState = {
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  progress: Record<string, LessonProgress>;
  badges: string[];
  perfectQuizzes: number;
  theme: Theme;
  accent: Accent;
  duelsWon: number;
  duelsPlayed: number;
  favorites: string[]; // любими уроци (lesson id-та)
  practical: Record<string, { completedAt: string }>; // изпълнени практически мисии
  dailyChallenge: { date: string; correct: boolean } | null; // днешното предизвикателство
  dailyCorrectCount: number; // общо верни дневни предизвикателства (за Финансов IQ)
  notifications: Record<string, boolean>; // предпочитания за известия
  sidebarCollapsed: boolean; // свит сайдбар (само икони)
  gradeLevel: GradeLevel; // ниво на съдържанието по клас (А/Б/В)
};

const DEFAULT_STATE: GameState = {
  name: "Ивайло",
  avatar: "fox",
  xp: 2600,
  streak: 3,
  lastActiveDate: null,
  progress: {},
  badges: [],
  perfectQuizzes: 0,
  theme: "system",
  accent: "blue",
  duelsWon: 0,
  duelsPlayed: 0,
  favorites: [],
  practical: {},
  dailyChallenge: null,
  dailyCorrectCount: 0,
  notifications: {
    dailyReminder: true,
    streakWarning: true,
    duelInvites: true,
    finiTips: true,
    weeklyReport: false,
  },
  sidebarCollapsed: false,
  gradeLevel: "A",
};

const STORAGE_KEY = "allianz-academy-state";

type GameContextType = {
  state: GameState;
  level: number;
  completeLesson: (lessonId: string, score: number, xpEarned: number, badgeId?: string) => { leveledUp: boolean; newBadge: string | null };
  recordDuel: (won: boolean, xpEarned: number) => { leveledUp: boolean; newBadge: string | null };
  toggleFavorite: (lessonId: string) => void;
  completePractical: (id: string, xp: number) => boolean;
  answerDaily: (correct: boolean, xp: number) => void;
  updateSettings: (patch: Partial<Pick<GameState, "name" | "avatar" | "theme" | "accent" | "notifications" | "sidebarCollapsed" | "gradeLevel">>) => void;
  resetProgress: () => void;
  ready: boolean;
};

const GameContext = createContext<GameContextType | null>(null);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Сливане с DEFAULT_STATE — по-стари записи може да нямат новите полета (theme/accent)
        const saved = { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<GameState>) };
        saved.notifications = { ...DEFAULT_STATE.notifications, ...saved.notifications };
        // Миграция: стари записи пазят аватара като емоджи
        const emojiAvatars: Record<string, string> = { "🦊": "fox", "🐻": "bear", "🐱": "cat", "🦉": "owl", "🐼": "panda", "🦁": "lion", "🐺": "wolf", "🦅": "eagle", "🐯": "tiger", "🦈": "shark", "🦋": "butterfly", "🐸": "frog" };
        if (emojiAvatars[saved.avatar]) saved.avatar = emojiAvatars[saved.avatar];
        else if (!/^[a-z-]+$/.test(saved.avatar)) saved.avatar = "fox";
        // Миграция: демо-ученикът беше преименуван Алекс → Ивайло
        if (saved.name === "Алекс") saved.name = DEFAULT_STATE.name;
        // Обновяване на серията при ново отваряне
        const today = todayStr();
        if (saved.lastActiveDate && saved.lastActiveDate !== today) {
          const last = new Date(saved.lastActiveDate);
          const diffDays = Math.round((new Date(today).getTime() - last.getTime()) / 86400000);
          if (diffDays === 1) saved.streak += 1;
          else if (diffDays > 1) saved.streak = 1;
        }
        saved.lastActiveDate = today;
        setState(saved);
      } else {
        setState({ ...DEFAULT_STATE, lastActiveDate: todayStr() });
      }
    } catch {
      setState({ ...DEFAULT_STATE, lastActiveDate: todayStr() });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  // Прилагане на тема и акцентен цвят върху <html>
  useEffect(() => {
    if (!ready) return;
    const el = document.documentElement;
    const apply = () => {
      const dark =
        state.theme === "dark" ||
        (state.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      el.classList.toggle("dark", dark);
      el.dataset.accent = state.accent;
    };
    apply();
    if (state.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [state.theme, state.accent, ready]);

  const completeLesson = useCallback(
    (lessonId: string, score: number, xpEarned: number, badgeId?: string) => {
      let leveledUp = false;
      let newBadge: string | null = null;
      setState((prev) => {
        const alreadyDone = !!prev.progress[lessonId];
        const xpGain = alreadyDone ? Math.round(xpEarned / 2) : xpEarned; // повторение дава половин XP
        const newXp = prev.xp + xpGain;
        leveledUp = levelFromXp(newXp) > levelFromXp(prev.xp);
        const perfect = score === 100;
        const badges = [...prev.badges];
        if (badgeId && !badges.includes(badgeId)) {
          badges.push(badgeId);
          newBadge = badgeId;
        }
        return {
          ...prev,
          xp: newXp,
          badges,
          perfectQuizzes: perfect && !alreadyDone ? prev.perfectQuizzes + 1 : prev.perfectQuizzes,
          progress: {
            ...prev.progress,
            [lessonId]: { status: "completed", score, perfect, completedAt: new Date().toISOString() },
          },
        };
      });
      return { leveledUp, newBadge };
    },
    []
  );

  const recordDuel = useCallback((won: boolean, xpEarned: number) => {
    let leveledUp = false;
    let newBadge: string | null = null;
    setState((prev) => {
      const newXp = prev.xp + xpEarned;
      leveledUp = levelFromXp(newXp) > levelFromXp(prev.xp);
      const duelsWon = prev.duelsWon + (won ? 1 : 0);
      const badges = [...prev.badges];
      if (duelsWon >= 3 && !badges.includes("duel-master")) {
        badges.push("duel-master");
        newBadge = "duel-master";
      }
      return {
        ...prev,
        xp: newXp,
        badges,
        duelsWon,
        duelsPlayed: prev.duelsPlayed + 1,
      };
    });
    return { leveledUp, newBadge };
  }, []);

  const toggleFavorite = useCallback((lessonId: string) => {
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(lessonId)
        ? prev.favorites.filter((id) => id !== lessonId)
        : [...prev.favorites, lessonId],
    }));
  }, []);

  // Практическа мисия: XP се дава само първия път
  const completePractical = useCallback((id: string, xp: number) => {
    let awarded = false;
    setState((prev) => {
      if (prev.practical[id]) return prev;
      awarded = true;
      return {
        ...prev,
        xp: prev.xp + xp,
        practical: { ...prev.practical, [id]: { completedAt: new Date().toISOString() } },
      };
    });
    return awarded;
  }, []);

  // Дневно предизвикателство: по едно на ден
  const answerDaily = useCallback((correct: boolean, xp: number) => {
    setState((prev) =>
      prev.dailyChallenge?.date === todayStr()
        ? prev
        : {
            ...prev,
            xp: prev.xp + xp,
            dailyChallenge: { date: todayStr(), correct },
            dailyCorrectCount: prev.dailyCorrectCount + (correct ? 1 : 0),
          }
    );
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<Pick<GameState, "name" | "avatar" | "theme" | "accent" | "notifications" | "sidebarCollapsed" | "gradeLevel">>) => {
      setState((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...DEFAULT_STATE,
      lastActiveDate: todayStr(),
      // Настройките се запазват при нулиране на прогреса
      name: prev.name,
      avatar: prev.avatar,
      theme: prev.theme,
      accent: prev.accent,
      sidebarCollapsed: prev.sidebarCollapsed,
      gradeLevel: prev.gradeLevel,
    }));
  }, []);

  const level = levelFromXp(state.xp);

  return (
    <GameContext.Provider value={{ state, level, completeLesson, recordDuel, toggleFavorite, completePractical, answerDaily, updateSettings, resetProgress, ready }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
