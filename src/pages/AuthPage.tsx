import { useState } from 'react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import {
  Kanban,
  ShieldCheck,
  Lightning,
  UsersThree,
  ChartLineUp,
} from '@phosphor-icons/react'

const features = [
  {
    icon: Lightning,
    title: 'Flujos de trabajo ágiles',
    desc: 'Organiza tareas y proyectos con tableros diseñados para equipos de alto rendimiento.',
  },
  {
    icon: UsersThree,
    title: 'Colaboración en tiempo real',
    desc: 'Sincroniza a todo tu equipo con actualizaciones instantáneas y permisos granulares.',
  },
  {
    icon: ChartLineUp,
    title: 'Visibilidad ejecutiva',
    desc: 'Métricas y reportes claros para tomar decisiones basadas en datos.',
  },
]

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-surface-50 lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-primary-700 via-primary-600 to-primary-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.4) 0, transparent 45%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/25">
              <Kanban size={36} weight="duotone" className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">Canvan</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90 ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck size={18} weight="fill" /> Plataforma empresarial
          </p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            La forma profesional de gestionar el trabajo de tu equipo.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Canvan unifica tableros, equipos y métricas en una sola plataforma diseñada
            para empresas que exigen claridad, seguridad y velocidad.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-4">
                <div className="mt-0.5 flex h-14 w-14 flex-none items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
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
          <ShieldCheck size={24} weight="duotone" />
          <span>Datos cifrados · Control de accesos · Alta disponibilidad</span>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              <Kanban size={30} weight="duotone" className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-surface-900">Canvan</span>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-xl shadow-primary-900/5 sm:p-10">
            {isLogin ? (
              <LoginForm onToggle={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggle={() => setIsLogin(true)} />
            )}
          </div>

          <p className="mt-6 text-center text-xs text-surface-500">
            Al continuar aceptas nuestros{' '}
            <a href="#" className="font-medium text-surface-700 hover:text-primary-600">
              Términos
            </a>{' '}
            y{' '}
            <a href="#" className="font-medium text-surface-700 hover:text-primary-600">
              Política de privacidad
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
