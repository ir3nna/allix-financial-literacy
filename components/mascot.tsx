// Маскот на платформата — Аликс (орелът). Растерна илюстрация с прозрачен фон.
// Различни пози (pose) за различни моменти: съвет, победа, идея, спестяване и т.н.

import { cn } from "@/lib/utils";

// Позите съответстват на файлове в public/mascots/*.png
const POSES = {
  default: "/mascot.png",   // изправен, неутрален
  point: "/mascots/point.png",   // вдигнат пръст — съвет/подсказка
  thumb: "/mascots/thumb.png",   // палец нагоре — браво/окуражаване
  read: "/mascots/read.png",     // чете книга — история/учене
  idea: "/mascots/idea.png",     // книга + крушка — ключова идея
  piggy: "/mascots/piggy.png",   // прегръща касичка — спестяване
  trophy: "/mascots/trophy.png", // купа — победа/перфектно
  coin: "/mascots/coin.png",     // евро монета — пари
  laptop: "/mascots/laptop.png", // лаптоп върху монети — симулатор/анализ
} as const;

export type MascotPose = keyof typeof POSES;

export function Mascot({
  size = 32,
  pose = "default",
  className,
}: {
  size?: number;
  pose?: MascotPose;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={POSES[pose]}
      alt="Аликс"
      className={cn("select-none object-contain", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
