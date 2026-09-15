// Рисувани финансови драсканици за фон — леки, ненатрапчиви (монети, звезди, графики…).
// Използва се в уроци и мисии, за да „оживи" голямата карта.

export function DoodleBg({ color, opacity = 0.06 }: { color: string; opacity?: number }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ color, opacity }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="fin-doodles" width="220" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Монета с € */}
            <circle cx="34" cy="40" r="16" />
            <path d="M40 32c-6-3-12 1-12 8s6 11 12 8M26 39h11M26 44h9" />
            {/* Звезда */}
            <path d="M168 30l3.5 7.6 8.3.8-6.2 5.6 1.8 8.1-7.4-4.3-7.4 4.3 1.8-8.1-6.2-5.6 8.3-.8z" />
            {/* Растящи стълбове */}
            <path d="M104 168v-20M114 168v-34M124 168v-48M100 168h28" />
            <path d="M100 143l9-10 7 6 11-16" />
            {/* Стрелка нагоре */}
            <path d="M44 166c0-14 24-14 24-30M58 132l10-6 2 11" />
            {/* Процент */}
            <path d="M164 128l22 30M165 130a4.5 4.5 0 100 .1M185 152a4.5 4.5 0 100 .1" />
            {/* Прасенце-касичка */}
            <path d="M128 66c16-7 30 4 28 16-1 7-9 11-16 9M126 68c-3 5 0 12 7 14" />
            <circle cx="150" cy="80" r="1.6" />
            {/* Драсканица долар */}
            <path d="M196 96c-5-2-10 1-10 5s10 4 10 8-5 7-10 5M191 92v26" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#fin-doodles)" />
    </svg>
  );
}
