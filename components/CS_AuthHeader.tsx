"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CS_UserPrincipal } from "@/types/CS_UserPrincipal";

export function CS_AuthHeader() {
  const router = useRouter();
  const [user, setUser] = useState<CS_UserPrincipal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <span className="hidden h-9 w-24 animate-pulse rounded-lg bg-cie-blue/10 sm:inline-block" />
    );
  }

  if (!user) return null;

  return (
    <div className="flex max-w-[12rem] flex-col items-end gap-1 sm:max-w-none">
      <p className="truncate text-xs font-medium text-cie-blue-dark sm:text-sm">
        {user.nombre || user.usuario}
      </p>
      <button
        type="button"
        onClick={logout}
        className="text-xs font-medium text-cie-red hover:underline"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
