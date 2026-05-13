import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/api'
import { WarningCircleIcon, CaretDown } from '@phosphor-icons/react'
import { useMountFade } from "@/shared/hooks/useGsapAnimation";

const TEST_ACCOUNTS = [
  { email: 'alice@kanban.dev', label: 'Tech Lead (dueño Board 1)' },
  { email: 'bob@kanban.dev', label: 'Frontend Dev (dueño Board 2)' },
  { email: 'carol@kanban.dev', label: 'UX Designer' },
  { email: 'dave@kanban.dev', label: 'Backend Dev' },
  { email: 'eve@kanban.dev', label: 'Mobile Dev (dueño Board 3)' },
  { email: 'frank@kanban.dev', label: 'DevOps Engineer' },
  { email: 'grace@kanban.dev', label: 'Data Engineer' },
];

const PASSWORD = 'Passw0rd!';

export function LoginForm() {
  const navigate = useNavigate()
  const formRef = useMountFade<HTMLFormElement>({ direction: "up", distance: 20, delay: 0.15 })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Email o contraseña incorrectos')
      } else {
        setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Bienvenido de vuelta
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-dark">
          Inicia sesión
        </h1>
        <p className="mt-2 text-sm text-neutral-dark/70">
          Accede a tus tableros y continúa donde lo dejaste.
        </p>
      </div>

      {error && (
        <div
          role="alert"
           className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger"
        >
           <WarningCircleIcon size={22} weight="fill" className="mt-0.5 flex-none text-danger/80" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDropdown((p) => !p)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-neutral-light bg-neutral-light/50 px-3 py-2 text-sm text-neutral-dark/60 transition-colors hover:border-primary/40 hover:text-neutral-dark"
        >
          <span>Credenciales de prueba</span>
          <CaretDown
            size={14}
            weight="bold"
            className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-neutral-light bg-surface shadow-lg">
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onMouseDown={() => {
                  setEmail(acc.email);
                  setPassword(PASSWORD);
                  setShowDropdown(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-neutral-dark/80 transition-colors hover:bg-neutral-light-hover"
              >
                <span className="font-medium text-neutral-dark">{acc.email.split('@')[0]}</span>
                <span className="text-neutral-dark/50">·</span>
                <span className="text-xs text-neutral-dark/50">{acc.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="nombre@empresa.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-dark">Contraseña</label>
          <button type="button" className="cursor-pointer text-xs font-medium text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" className="mt-1 w-full" size="lg" disabled={loading}>
        {loading ? 'Iniciando…' : 'Iniciar sesión'}
      </Button>

      <p className="text-center text-sm text-neutral-dark/70">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="cursor-pointer font-semibold text-primary hover:underline"
        >
          Crear cuenta
        </button>
      </p>
    </form>
  )
}
