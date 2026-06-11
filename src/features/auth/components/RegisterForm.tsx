import { useState, useReducer } from 'react'
import type { SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/stores/authStore'
import { ApiError } from '@/services/api'
import { WarningCircleIcon, CaretDownIcon } from '@phosphor-icons/react'
import { useMountFade } from "@/shared/hooks/useGsapAnimation";
import { INITIAL_FORM, type FormField } from '../utils/constants'

function formReducer(state: typeof INITIAL_FORM, action: { field: FormField; value: string }) {
  return { ...state, [action.field]: action.value };
}

export function RegisterForm() {
  const navigate = useNavigate()
  const formRef = useMountFade<HTMLFormElement>({ direction: "up", distance: 20, delay: 0.15 })
  const [form, dispatch] = useReducer(formReducer, INITIAL_FORM)
  const [showExtra, setShowExtra] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((state) => state.register)

  const setForm = (field: FormField) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ field, value: e.target.value });

  const { name, email, password, username, displayName, jobTitle, company } = form;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
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
      navigate('/boards')
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
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Comienza gratis
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-dark">
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
        onChange={setForm('name')}
        autoComplete="name"
        required
      />
      <Input
        label="Email"
        type="email"
        placeholder="nombre@empresa.com"
        value={email}
        onChange={setForm('email')}
        autoComplete="email"
        required
      />
      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        value={password}
        onChange={setForm('password')}
        autoComplete="new-password"
        required
      />

      <button
        type="button"
        onClick={() => setShowExtra((p) => !p)}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
      >
        <CaretDownIcon
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
            onChange={setForm('username')}
            autoComplete="username"
          />
          <Input
            label="Nombre público"
            type="text"
            placeholder="Ana García"
            value={displayName}
            onChange={setForm('displayName')}
          />
          <Input
            label="Cargo"
            type="text"
            placeholder="Product Designer"
            value={jobTitle}
            onChange={setForm('jobTitle')}
          />
          <Input
            label="Empresa"
            type="text"
            placeholder="Acme Inc."
            value={company}
            onChange={setForm('company')}
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
