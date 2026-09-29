"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

function CS_IconUser({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CS_IconLock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path strokeLinecap="round" d="M8 11V7a4 4 0 118 0v4" />
    </svg>
  );
}

function CS_IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CS_IconEyeOff({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.4 10.4 0 0112 4c6.5 0 10 7 10 7a18.5 18.5 0 01-4.22 5.12M6.12 6.12A18.5 18.5 0 002 12s3.5 7 10 7a10.4 10.4 0 005.76-1.76"
      />
    </svg>
  );
}

export function CS_LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contrasena }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo iniciar sesión");
      }
      router.replace(next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="cs-login-card w-full max-w-[420px] px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-cie-blue/10 ring-1 ring-cie-blue/15">
          <Image
            src="/Logo_CIE.JPG"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-md object-contain"
            aria-hidden
          />
        </div>
        <h1 className="mt-5 text-xl font-bold text-cie-blue-dark sm:text-2xl">
          Reportes de Gestión Humana
        </h1>
        <p className="mt-2 text-sm text-cie-muted">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cie-blue-dark">
            <CS_IconUser className="size-4 text-cie-blue" />
            Usuario
          </div>
          <input
            className="cs-login-input"
            name="usuario"
            autoComplete="username"
            placeholder="Ingresa tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cie-blue-dark">
            <CS_IconLock className="size-4 text-cie-blue" />
            Contraseña
          </div>
          <div className="relative">
            <input
              className="cs-login-input pr-12"
              type={showPassword ? "text" : "password"}
              name="contrasena"
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cie-muted transition hover:text-cie-blue"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <CS_IconEyeOff className="size-5" />
              ) : (
                <CS_IconEye className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p
          className="mt-4 rounded-full bg-cie-red/10 px-4 py-2 text-center text-sm font-medium text-cie-red"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="cs-login-btn mt-8"
      >
        {loading ? "Validando…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
