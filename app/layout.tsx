import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { GameProvider } from "@/lib/game-state";
import { Nav } from "@/components/nav";
import { Header } from "@/components/header";
import { FiniWidget } from "@/components/fini";

export const metadata: Metadata = {
  title: "Allianz Academy — финансова грамотност",
  description:
    "Геймифицирана платформа за финансова грамотност за ученици 14–18 г. Мисии, XP, значки и класации.",
};

// Прилага темата преди първото изчертаване, за да няма светкавица от грешен цвят
const themeInitScript = `try{
var s=JSON.parse(localStorage.getItem("allianz-academy-state")||"{}");
var t=s.theme||"system";
var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var e=document.documentElement;
e.classList.toggle("dark",d);
e.dataset.accent=s.accent||"blue";
e.style.setProperty("--sidebar-w",s.sidebarCollapsed?"4.5rem":"16rem");
}catch(err){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <GameProvider>
          <Suspense fallback={null}>
            <Nav />
          </Suspense>
          <main className="min-h-screen pb-24 transition-[padding] duration-300 ease-out md:pb-8 md:pl-[var(--sidebar-w)]">
            <Header />
            <div className="mx-auto max-w-[1700px] px-4 py-6 md:px-8">{children}</div>
          </main>
          <FiniWidget />
        </GameProvider>
      </body>
    </html>
  );
}
