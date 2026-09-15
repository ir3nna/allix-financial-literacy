"use client";

// 🦅 Аликс — плаващ AI помощник, достъпен от всяка страница.
// Демо: отговаря от локална база знания (lib/fini.ts); готов за LLM интеграция.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { Thiing } from "@/components/thiing";
import { Mascot, type MascotPose } from "@/components/mascot";
import { useGame } from "@/lib/game-state";
import { FINI, FINI_QUICK_QUESTIONS, finiReply } from "@/lib/fini";
import { cn } from "@/lib/utils";

type Message = { from: "fini" | "me"; text: string };

// Балонче на Аликс за вграждане в уроци/дуели — едро и забележимо, защото съветът е важен.
// Аликс сочи към текста (палец нагоре при успех). Позата може да се подаде изрично.
export function FiniBubble({
  children,
  tone = "info",
  pose,
}: {
  children: React.ReactNode;
  tone?: "info" | "success" | "warn";
  pose?: MascotPose;
}) {
  const effPose: MascotPose = pose ?? (tone === "success" ? "thumb" : "point");
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <Mascot pose={effPose} size={80} className="-mb-1 shrink-0 drop-shadow-sm" />
      <div
        className={cn(
          "relative mt-1 flex-1 rounded-2xl rounded-tl-sm border p-4 text-base font-medium leading-relaxed shadow-sm",
          tone === "success" && "border-success/30 bg-success/10 text-green-800 dark:text-green-300",
          tone === "warn" && "border-warning/30 bg-warning/10 text-amber-800 dark:text-amber-300",
          tone === "info" && "border-line bg-card text-fg/90"
        )}
      >
        {/* Опашка на балончето към Аликс */}
        <span
          className={cn(
            "absolute -left-1.5 top-4 h-3 w-3 rotate-45 border-b border-l",
            tone === "success" && "border-success/30 bg-success/10",
            tone === "warn" && "border-warning/30 bg-warning/10",
            tone === "info" && "border-line bg-card"
          )}
        />
        <span className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-allianz">{FINI.name}</span>
        {children}
      </div>
    </div>
  );
}

export function FiniWidget() {
  const pathname = usePathname();
  const { state, level, ready } = useGame();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Поздрав при първо отваряне
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          from: "fini",
          text: `Здравей, ${state.name}! Аз съм ${FINI.name} — ${FINI.title}. Питай ме за всичко около парите или избери въпрос отдолу!`,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Автоскрол до последното съобщение
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, typing]);

  if (!ready) return null;
  if (["/parent", "/teacher", "/admin"].some((p) => pathname.startsWith(p))) return null;

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((m) => [...m, { from: "me", text: clean }]);
    setInput("");
    setTyping(true);
    // Малка пауза, за да усеща като разговор (тук се вклюва LLM при интеграция)
    setTimeout(() => {
      setMessages((m) => [...m, { from: "fini", text: finiReply(clean, { name: state.name, level }) }]);
      setTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Плаващ бутон */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Затвори Аликс" : "Отвори Аликс — финансовия помощник"}
        className={cn(
          "fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-lg transition-all cursor-pointer md:bottom-6 md:right-6",
          open
            ? "bg-allianz shadow-allianz/40"
            : "bg-allianz/10 ring-2 ring-allianz/25 shadow-allianz/20 hover:scale-110 active:scale-95 animate-float dark:bg-allianz/20"
        )}
      >
        {open ? (
          <X size={26} className="text-white" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/aliks-avatar.png" alt="Аликс" className="h-full w-full object-cover" draggable={false} />
        )}
      </button>

      {/* Чат панел */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-36 right-4 z-50 flex max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl md:bottom-24 md:right-6"
          >
            {/* Заглавие */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-allianz to-allianz-dark p-4 text-white">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/aliks-avatar.png" alt="Аликс" className="h-full w-full object-cover" draggable={false} />
              </div>
              <div>
                <div className="font-extrabold leading-tight">{FINI.name}</div>
                <div className="text-xs font-semibold text-white/75">{FINI.title}</div>
              </div>
            </div>

            {/* Съобщения */}
            <div ref={listRef} className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto p-4">
              {messages.map((msg, i) =>
                msg.from === "fini" ? (
                  <div key={i} className="flex">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-soft p-3 text-sm font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-allianz p-3 text-sm font-semibold text-white">
                      {msg.text}
                    </div>
                  </div>
                )
              )}
              {typing && (
                <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                  Аликс пише…
                </div>
              )}
            </div>

            {/* Бързи въпроси */}
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {FINI_QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-allianz/30 bg-allianz/5 px-3 py-1.5 text-xs font-bold text-allianz transition-colors cursor-pointer hover:bg-allianz/15"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Вход */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-line p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Попитай Аликс…"
                className="flex-1 rounded-xl border-2 border-line bg-soft/50 px-3.5 py-2.5 text-sm font-medium outline-none transition-colors focus:border-allianz"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Изпрати"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-allianz text-white transition-all cursor-pointer hover:bg-allianz-dark active:scale-95 disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
