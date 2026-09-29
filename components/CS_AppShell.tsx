"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CS_AuthHeader } from "@/components/CS_AuthHeader";
import { CS_ThemeToggle } from "@/components/CS_ThemeToggle";
import Image from "next/image";
import Link from "next/link";

export function CS_AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-cie-surface via-background to-cie-surface px-4 py-10 dark:from-cie-surface dark:via-background dark:to-cie-surface">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <CS_ThemeToggle />
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-cie-muted">
          © {new Date().getFullYear()} CIE · Gestión Humana
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-cie-blue/15 bg-background shadow-sm transition-colors duration-250">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cie-blue"
          >
            <Image
              src="/Logo_CIE.JPG"
              alt="Logo CIE"
              width={56}
              height={56}
              priority
              className="h-11 w-11 shrink-0 rounded-md object-contain sm:h-14 sm:w-14"
            />
            <div className="min-w-0 leading-tight">
              <p className="text-lg font-bold tracking-tight text-cie-blue sm:text-xl">
                CIE
              </p>
              <p className="hidden text-[11px] font-medium text-cie-red sm:block sm:text-xs">
                Centro de Intervención Edu-Terapéutico
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <CS_AuthHeader />
            <div className="min-w-0 flex-1 border-l-4 border-cie-yellow pl-3 sm:max-w-xs sm:flex-1 sm:border-l-0 sm:pl-0 sm:text-right lg:max-w-md">
              <p className="text-sm font-semibold text-cie-blue-dark sm:text-base">
                Reportes de Gestión Humana
              </p>
              <p className="mt-0.5 text-xs text-cie-muted sm:text-sm">
                Consultas y exportación a Excel
              </p>
            </div>
            <CS_ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
      <footer className="mt-auto border-t border-cie-blue/10 bg-background py-4 text-center text-xs text-cie-muted transition-colors duration-250">
        © {new Date().getFullYear()} CIE · Gestión Humana
      </footer>
    </>
  );
}
