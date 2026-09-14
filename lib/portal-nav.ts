// Навигация на порталите за възрастни — табовете се показват в сайдбара (десктоп)
// и като хоризонтални пилове на мобилни. Активният таб се чете от ?tab= в URL-а.

import {
  LayoutDashboard, TrendingUp, CalendarDays, Lightbulb,
  ClipboardList, Users2, Download,
  BookOpen, HelpCircle, Gamepad2, BookMarked, Video, Award, Target,
  type LucideIcon,
} from "lucide-react";

export type PortalTab = { key: string; label: string; icon: LucideIcon };

export type PortalDef = {
  base: string;
  title: string;
  subtitle: string;
  tabs: PortalTab[];
};

export const PORTALS_NAV: PortalDef[] = [
  {
    base: "/parent",
    title: "Родителски портал",
    subtitle: "Напредъкът на детето ви",
    tabs: [
      { key: "overview", label: "Преглед", icon: LayoutDashboard },
      { key: "strengths", label: "Силни и слаби страни", icon: TrendingUp },
      { key: "activity", label: "Активност", icon: CalendarDays },
      { key: "recommendations", label: "Препоръки", icon: Lightbulb },
    ],
  },
  {
    base: "/teacher",
    title: "Учителски портал",
    subtitle: "Клас, домашни, резултати",
    tabs: [
      { key: "overview", label: "Обзор на класа", icon: LayoutDashboard },
      { key: "homework", label: "Домашни", icon: ClipboardList },
      { key: "results", label: "Резултати", icon: Users2 },
      { key: "reports", label: "Отчети", icon: Download },
    ],
  },
  {
    base: "/admin",
    title: "Админ портал",
    subtitle: "Управление на съдържанието",
    tabs: [
      { key: "lessons", label: "Уроци", icon: BookOpen },
      { key: "questions", label: "Въпроси", icon: HelpCircle },
      { key: "games", label: "Игри", icon: Gamepad2 },
      { key: "glossary", label: "Речник", icon: BookMarked },
      { key: "videos", label: "Видеа", icon: Video },
      { key: "badges", label: "Значки", icon: Award },
      { key: "missions", label: "Мисии", icon: Target },
    ],
  },
];

export const portalForPath = (pathname: string) =>
  PORTALS_NAV.find((p) => pathname.startsWith(p.base)) ?? null;
