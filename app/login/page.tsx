import { Suspense } from "react";
import { CS_LoginForm } from "@/components/CS_LoginForm";

function CS_LoginFallback() {
  return (
    <div className="cs-login-card w-full max-w-[420px] px-6 py-10 text-center text-sm text-cie-muted">
      Cargando…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<CS_LoginFallback />}>
      <CS_LoginForm />
    </Suspense>
  );
}
