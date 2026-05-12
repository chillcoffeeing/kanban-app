import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/api'
import { WarningCircleIcon, CaretDown } from '@phosphor-icons/react'

export function RegisterForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [showExtra, setShowExtra] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((state) => state.register)

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
      await register(email, name, password, {
        username: username.trim() || undefined,
        displayName: displayName.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
      })
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
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Comienza gratis
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-dark">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-sm text-neutral-dark/70">
          Empieza a organizar el trabajo de tu equipo en minutos. Sin tarjeta de crédito.
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
        label="Email"
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

      <button
        type="button"
        onClick={() => setShowExtra((p) => !p)}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
      >
        <CaretDown
          size={14}
          weight="bold"
          className={`transition-transform duration-200 ${showExtra ? 'rotate-0' : '-rotate-90'}`}
        />
        Más información (opcional)
      </button>

      {showExtra && (
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-light bg-neutral-light/50 p-4">
          <Input
            label="Nombre de usuario"
            type="text"
            placeholder="anagarcia"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Nombre público"
            type="text"
            placeholder="Ana García"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="Cargo"
            type="text"
            placeholder="Product Designer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Input
            label="Empresa"
            type="text"
            placeholder="Acme Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      )}

      <Button type="submit" className="mt-1 w-full" size="lg" disabled={loading}>
        {loading ? 'Creando…' : 'Crear cuenta'}
      </Button>

      <p className="text-center text-sm text-neutral-dark/70">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="cursor-pointer font-semibold text-primary hover:underline"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  )
}
