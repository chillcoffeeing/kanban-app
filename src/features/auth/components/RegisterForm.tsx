import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/api'
import { WarningCircleIcon } from '@phosphor-icons/react'

interface RegisterFormProps {
  onToggle: () => void
}

export function RegisterForm({ onToggle }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    setLoading(true)
    try {
      await register(email, name, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Ya existe una cuenta con ese email')
      } else {
        setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Comienza gratis
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-surface-900">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-surface-500">
          Empieza a organizar el trabajo de tu equipo en minutos. Sin tarjeta de crédito.
        </p>
      </div>

      {error && (
        <div
          role="alert"
           className="flex items-start gap-2 rounded-lg border border-danger-200 bg-bg-danger px-3 py-2.5 text-sm text-fg-danger"
        >
           <WarningCircleIcon size={22} weight="fill" className="mt-0.5 flex-none text-fg-danger" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Nombre completo"
        type="text"
        placeholder="Ana García"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
        required
      />
      <Input
        label="Email corporativo"
        type="email"
        placeholder="nombre@empresa.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <Button type="submit" className="mt-1 w-full" size="lg" disabled={loading}>
        {loading ? 'Creando…' : 'Crear cuenta'}
      </Button>

      <p className="text-center text-sm text-surface-500">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer font-semibold text-primary-600 hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  )
}
