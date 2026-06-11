import { useState, useEffect, useRef } from "react";

const ESTIMATED_SECONDS = 50;

export function ColdStartLoader() {
  const [seconds, setSeconds] = useState(ESTIMATED_SECONDS);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  useEffect(() => {
    if (!tooltipOpen) return;
    const close = (e: MouseEvent) => {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) {
        setTooltipOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [tooltipOpen]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white">
      <div className="inline-block size-12 animate-spin rounded-full border-4 border-neutral-light border-t-primary" />

      <div className="flex flex-col items-center gap-1">
        <p className="text-lg text-neutral-dark/70">
          Iniciando servidor&hellip;
        </p>
        <p className="text-6xl font-bold tabular-nums text-primary">
          {seconds}
          <span className="text-2xl font-normal text-neutral-dark/50">s</span>
        </p>
      </div>

      <div className="relative max-w-md text-center">
        <p className="text-sm text-neutral-dark/60">
          El servidor backend está en un plan gratuito que hiberna tras
          inactividad. El primer encendido toma ~50s.
        </p>

        <p
          className="mt-3 text-base font-semibold tracking-tight text-neutral-dark"
          style={{ fontSize: "1.05rem" }}
        >
          Las siguientes peticiones responden con latencia normal mientras el contenedor se mantenga activo.
        </p>

        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-dark/40 hover:text-neutral-dark/70"
          onClick={() => setTooltipOpen(!tooltipOpen)}
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          ¿Por qué ocurre esto?
        </button>

        {tooltipOpen && (
          <div
            ref={tipRef}
            className="absolute left-1/2 top-full z-10 mt-2 w-72 -translate-x-1/2 rounded-lg border border-neutral-light bg-white p-3 text-left shadow-lg"
          >
            <p className="text-xs leading-relaxed text-neutral-dark/70">
              El servidor está desplegado en un plan de infraestructura gratuito
              que hiberna el contenedor tras períodos de inactividad. El primer
              request post-hibernación dispara un <em>cold start</em>: el
              proveedor descarga la imagen, inicializa el runtime, levanta el
              proceso y establece conexiones a la base de datos — todo antes de
              responder. Una vez activo, las siguientes requests responden con
              latencia normal (~100–300ms).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
