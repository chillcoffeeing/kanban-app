import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/api'
import { WarningCircle } from '@phosphor-icons/react'

interface LoginFormProps {
  onToggle: () => void
}

export function LoginForm({ onToggle }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Bienvenido de vuelta
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-surface-900">
          Inicia sesión
        </h1>
        <p className="mt-2 text-sm text-surface-500">
          Accede a tus tableros y continúa donde lo dejaste.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <WarningCircle size={22} weight="fill" className="mt-0.5 flex-none text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Email corporativo"
        type="email"
        placeholder="nombre@empresa.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-surface-700">Contraseña</label>
          <a href="#" className="text-xs font-medium text-primary-600 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
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

      <p className="text-center text-sm text-surface-500">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer font-semibold text-primary-600 hover:underline"
        >
          Crear cuenta
        </button>
      </p>
    </form>
  )
}
