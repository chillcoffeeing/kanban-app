import { RegisterForm } from "@/features/auth/components/RegisterForm";
import {
  KanbanIcon,
  ShieldCheckIcon,
  LightningIcon,
  UsersThreeIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";

const features = [
  {
    icon: LightningIcon,
    title: "Flujos de trabajo ágiles",
    desc: "Organiza tareas y proyectos con tableros diseñados para equipos de alto rendimiento.",
  },
  {
    icon: UsersThreeIcon,
    title: "Colaboración en tiempo real",
    desc: "Sincroniza a todo tu equipo con actualizaciones instantáneas y permisos granulares.",
  },
  {
    icon: ChartLineUpIcon,
    title: "Visibilidad ejecutiva",
    desc: "Métricas y reportes claros para tomar decisiones basadas en datos.",
  },
];

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-neutral-light pt-16 lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-primary via-secondary to-tertiary lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.4) 0, transparent 45%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/25">
              <KanbanIcon size={36} weight="duotone" className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              Kanban
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90 ring-1 ring-white/20 backdrop-blur">
            <ShieldCheckIcon size={18} weight="fill" /> Plataforma empresarial
          </p>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            La forma profesional de gestionar el trabajo de tu equipo.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Kanban unifica tableros, equipos y métricas en una sola plataforma
            diseñada para empresas que exigen claridad, seguridad y velocidad.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-4">
                <div className="mt-0.5 flex size-14 flex-none items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icon size={30} weight="duotone" className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-white/75">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-sm text-white/70">
          <ShieldCheckIcon size={24} weight="duotone" />
          <span>Datos cifrados · Control de accesos · Alta disponibilidad</span>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
              <KanbanIcon size={30} weight="duotone" className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-neutral-dark">
              Kanban
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-light bg-surface p-8 shadow-lg sm:p-10 animate-scaleIn">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-xs text-neutral-dark/60">
            Al continuar aceptas nuestros{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Términos
            </a>{" "}
            y{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Política de privacidad
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
