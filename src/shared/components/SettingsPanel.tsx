import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import {
  Sun,
  Moon,
  MoonStars,
  Palette,
  SquaresFour,
  DotsNine,
  GridFour,
  PaintBrushBroad,
  ArrowsInSimple,
  ArrowsOutSimple,
  Lightning,
  CheckCircle,
  ArrowCounterClockwise,
  User,
  PaintBucket,
  Bell,
  ShieldCheck,
  Link as LinkIcon,
  Envelope,
  DeviceMobile,
  At,
  UserCircle,
} from '@phosphor-icons/react'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import {
  useSettingsStore,
  BACKGROUNDS,
} from '@/stores/settingsStore'
import { useAuthStore } from '@/stores/authStore'
import type {
  UserDisplayPrefs,
  UserNotificationPrefs,
  UserPrivacyPrefs,
  UserSocialLinks,
} from '@/shared/types/user'
import { Modal } from './Modal'
import { Button } from './Button'
import { Toggle } from './Toggle'

const THEME_OPTIONS: Array<{ id: UserDisplayPrefs['theme']; label: string; Icon: PhosphorIcon }> = [
  { id: 'light', label: 'Claro', Icon: Sun },
  { id: 'dark', label: 'Oscuro', Icon: Moon },
  { id: 'midnight', label: 'Medianoche', Icon: MoonStars },
  { id: 'solarized', label: 'Solarized', Icon: Palette },
]

const BG_ICONS: Record<string, PhosphorIcon> = {
  plain: SquaresFour,
  dots: DotsNine,
  grid: GridFour,
  'gradient-blue': PaintBrushBroad,
  'gradient-sunset': PaintBrushBroad,
  'gradient-forest': PaintBrushBroad,
}

type TabId = 'profile' | 'appearance' | 'notifications' | 'privacy'

const TABS: Array<{ id: TabId; label: string; Icon: PhosphorIcon }> = [
  { id: 'profile', label: 'Perfil', Icon: User },
  { id: 'appearance', label: 'Apariencia', Icon: PaintBucket },
  { id: 'notifications', label: 'Notificaciones', Icon: Bell },
  { id: 'privacy', label: 'Privacidad', Icon: ShieldCheck },
]

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="mb-6">
      <h3 className="mb-1 text-content font-semibold text-fg-default">
        {title}
      </h3>
      {description && (
        <p className="mb-3 text-card-meta text-fg-subtle">{description}</p>
      )}
      {children}
    </section>
  )
}

interface FieldProps {
  label: string
  children: ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-card-meta font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default placeholder:text-fg-subtle focus:border-border-focus focus:outline-none"
    />
  )
}

interface RowProps {
  icon?: PhosphorIcon
  title: string
  description?: string
  children: ReactNode
}

function Row({ icon: Icon, title, description, children }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3">
      <div className="flex items-start gap-2">
        {Icon && <Icon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />}
        <div>
          <p className="text-content font-medium text-fg-default">{title}</p>
          {description && (
            <p className="text-card-meta text-fg-subtle">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

/* ------------------------------ PROFILE ------------------------------ */
function ProfileTab() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const updateUser = useAuthStore((s) => s.updateUser)

  if (!user) {
    return (
      <p className="text-content text-fg-muted">
        Inicia sesión para personalizar tu perfil.
      </p>
    )
  }

  const profile = user.profile
  const setField = <K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) =>
    updateProfile({ [key]: value } as Partial<typeof profile>)
  const setSocial = (key: keyof UserSocialLinks, value: string) =>
    updateProfile({ socials: { [key]: value || null } as Partial<UserSocialLinks> as UserSocialLinks })

  return (
    <div className="space-y-5">
      <Section title="Información básica">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nombre visible">
            <TextInput
              value={profile.displayName || ''}
              onChange={(e) => setField('displayName', e.target.value)}
            />
          </Field>
          <Field label="Nombre de cuenta">
            <TextInput
              value={user.name || ''}
              onChange={(e) => updateUser({ name: e.target.value })}
            />
          </Field>
          <Field label="Username (@handle)">
            <TextInput
              value={user.username || ''}
              onChange={(e) =>
                updateUser({ username: e.target.value || null })
              }
              placeholder="sin_espacios"
            />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={user.email || ''} disabled />
          </Field>
          <Field label="Puesto">
            <TextInput
              value={profile.jobTitle || ''}
              onChange={(e) => setField('jobTitle', e.target.value || null)}
              placeholder="Product Designer"
            />
          </Field>
          <Field label="Empresa">
            <TextInput
              value={profile.company || ''}
              onChange={(e) => setField('company', e.target.value || null)}
            />
          </Field>
          <Field label="Ubicación">
            <TextInput
              value={profile.location || ''}
              onChange={(e) => setField('location', e.target.value || null)}
              placeholder="Caracas, VE"
            />
          </Field>
          <Field label="URL de avatar">
            <TextInput
              value={profile.avatarUrl || ''}
              onChange={(e) => setField('avatarUrl', e.target.value || null)}
              placeholder="https://…"
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Bio">
            <textarea
              rows={3}
              value={profile.bio || ''}
              onChange={(e) => setField('bio', e.target.value || null)}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default placeholder:text-fg-subtle focus:border-border-focus focus:outline-none"
              placeholder="Cuéntale al equipo sobre ti…"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Redes sociales"
        description="Enlaces mostrados en tu perfil público."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {([
            ['website', 'Sitio web', LinkIcon],
            ['twitter', 'Twitter / X', At],
            ['github', 'GitHub', UserCircle],
            ['linkedin', 'LinkedIn', UserCircle],
            ['instagram', 'Instagram', UserCircle],
          ] as Array<[keyof UserSocialLinks, string, PhosphorIcon]>).map(([key, label, Icon]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2">
                <Icon size={20} weight="duotone" className="text-icon-muted" />
                <TextInput
                  value={profile.socials?.[key] || ''}
                  onChange={(e) => setSocial(key, e.target.value)}
                  placeholder={
                    key === 'twitter' ? '@usuario' : 'https://…'
                  }
                />
              </div>
            </Field>
          ))}
        </div>
      </Section>

      <Section
        title="Cuentas enlazadas"
        description="Proveedores con los que puedes iniciar sesión."
      >
        <div className="flex flex-wrap gap-2">
          {user.linkedProviders.map((p) => (
            <span
              key={`${p.provider}-${p.providerId}`}
              className="inline-flex items-center gap-2 rounded-pill bg-bg-muted px-3 py-1 text-card-meta text-fg-muted capitalize"
            >
              <ShieldCheck size={18} weight="duotone" /> {p.provider}
            </span>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ---------------------------- APPEARANCE ----------------------------- */
function AppearanceTab() {
  const s = useSettingsStore()
  return (
    <div>
      <Section title="Tema" description="Paleta de colores de la interfaz.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = s.theme === id
            return (
              <button
                key={id}
                onClick={() => s.setTheme(id)}
                className={`flex flex-col items-center gap-2 rounded-card border p-3 text-content transition-colors cursor-pointer ${
                  active
                    ? 'border-border-focus bg-bg-info text-fg-brand'
                    : 'border-border-default bg-bg-card text-fg-muted hover:border-border-strong'
                }`}
              >
                <Icon size={28} weight={active ? 'fill' : 'duotone'} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Fondo">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BACKGROUNDS.map(({ id, label }) => {
            const Icon = BG_ICONS[id] || SquaresFour
            const active = s.background === id
            return (
              <button
                key={id}
                onClick={() => s.setBackground(id)}
                className={`flex items-center gap-2 rounded-card border p-3 text-content transition-colors cursor-pointer ${
                  active
                    ? 'border-border-focus bg-bg-info text-fg-brand'
                    : 'border-border-default bg-bg-card text-fg-muted hover:border-border-strong'
                }`}
              >
                <Icon size={22} weight="duotone" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Densidad">
        <div className="flex gap-2">
          <button
            onClick={() => s.setDensity('comfortable')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-card border p-3 text-content cursor-pointer ${
              s.density === 'comfortable'
                ? 'border-border-focus bg-bg-info text-fg-brand'
                : 'border-border-default text-fg-muted hover:border-border-strong'
            }`}
          >
            <ArrowsOutSimple size={22} weight="duotone" /> Cómoda
          </button>
          <button
            onClick={() => s.setDensity('compact')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-card border p-3 text-content cursor-pointer ${
              s.density === 'compact'
                ? 'border-border-focus bg-bg-info text-fg-brand'
                : 'border-border-default text-fg-muted hover:border-border-strong'
            }`}
          >
            <ArrowsInSimple size={22} weight="duotone" /> Compacta
          </button>
        </div>
      </Section>

      <Section title="Idioma y formato">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Idioma">
            <select
              value={s.language}
              onChange={(e) => s.setLanguage(e.target.value as UserDisplayPrefs['language'])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </Field>
          <Field label="Zona horaria">
            <TextInput
              value={s.timezone || ''}
              onChange={(e) => s.setTimezone(e.target.value)}
              placeholder="America/Caracas"
            />
          </Field>
          <Field label="Formato de hora">
            <select
              value={s.timeFormat}
              onChange={(e) => s.setTimeFormat(e.target.value as UserDisplayPrefs['timeFormat'])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="24h">24h</option>
              <option value="12h">12h (AM/PM)</option>
            </select>
          </Field>
          <Field label="Formato de fecha">
            <select
              value={s.dateFormat}
              onChange={(e) => s.setDateFormat(e.target.value as UserDisplayPrefs['dateFormat'])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="DMY">DD/MM/AAAA</option>
              <option value="MDY">MM/DD/AAAA</option>
              <option value="YMD">AAAA-MM-DD</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Accesibilidad y comportamiento">
        <div className="space-y-2">
          <Row
            icon={Lightning}
            title="Reducir animaciones"
            description="Desactiva transiciones no esenciales."
          >
            <Toggle
              checked={s.reducedMotion}
              onChange={s.setReducedMotion}
            />
          </Row>
          <Row
            icon={CheckCircle}
            title="Mostrar tarjetas completadas"
            description="Incluir tarjetas finalizadas en las listas."
          >
            <Toggle
              checked={s.showCompletedCards}
              onChange={s.setShowCompletedCards}
            />
          </Row>
        </div>
      </Section>
    </div>
  )
}

/* -------------------------- NOTIFICATIONS ---------------------------- */
function NotificationsTab() {
  const s = useSettingsStore()
  const n = s.notifications
  const rows: Array<[keyof UserNotificationPrefs, string, string, PhosphorIcon]> = [
    ['emailEnabled', 'Notificaciones por email', 'Recibe resúmenes y alertas por correo.', Envelope],
    ['pushEnabled', 'Notificaciones push', 'Avisos en el navegador o dispositivo.', DeviceMobile],
    ['mentions', 'Menciones', 'Cuando alguien te menciona (@).', At],
    ['cardAssigned', 'Tarjetas asignadas', 'Cuando te agregan a una tarjeta.', User],
    ['cardDueSoon', 'Vencimientos próximos', 'Alerta antes de la fecha de entrega.', Bell],
    ['boardInvites', 'Invitaciones a tableros', 'Cuando te invitan a colaborar.', Envelope],
    ['weeklyDigest', 'Resumen semanal', 'Actividad consolidada cada lunes.', Bell],
  ]

  return (
    <div className="space-y-2">
      {rows.map(([key, title, desc, Icon]) => (
        <Row key={key} icon={Icon} title={title} description={desc}>
          <Toggle
            checked={!!n[key]}
            onChange={(v) => s.setNotification(key, v)}
          />
        </Row>
      ))}
    </div>
  )
}

/* ----------------------------- PRIVACY ------------------------------- */
function PrivacyTab() {
  const s = useSettingsStore()
  const p = s.privacy

  return (
    <div className="space-y-2">
      <Row
        icon={User}
        title="Visibilidad del perfil"
        description="Quién puede ver tu perfil completo."
      >
        <select
          value={p.profileVisibility}
          onChange={(e) => s.setPrivacy('profileVisibility', e.target.value as UserPrivacyPrefs['profileVisibility'])}
          className="rounded-input border border-border-default bg-bg-card px-2 py-1 text-content text-fg-default"
        >
          <option value="public">Público</option>
          <option value="workspace">Espacio de trabajo</option>
          <option value="private">Privado</option>
        </select>
      </Row>
      <Row
        icon={Envelope}
        title="Mostrar email en perfil"
        description="Otros miembros pueden ver tu correo."
      >
        <Toggle checked={p.showEmail} onChange={(v) => s.setPrivacy('showEmail', v)} />
      </Row>
      <Row
        icon={Lightning}
        title="Mostrar actividad"
        description="Tu historial aparece en el feed del tablero."
      >
        <Toggle checked={p.showActivity} onChange={(v) => s.setPrivacy('showActivity', v)} />
      </Row>
      <Row
        icon={At}
        title="Permitir mensajes directos"
        description="Otros miembros pueden escribirte directamente."
      >
        <Toggle checked={p.allowDM} onChange={(v) => s.setPrivacy('allowDM', v)} />
      </Row>
      <Row
        icon={ShieldCheck}
        title="Excluirme de analíticas"
        description="No incluir mi uso en métricas agregadas."
      >
        <Toggle
          checked={p.analyticsOptOut}
          onChange={(v) => s.setPrivacy('analyticsOptOut', v)}
        />
      </Row>
    </div>
  )
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

/* ------------------------------- MAIN -------------------------------- */
export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<TabId>('profile')
  const reset = useSettingsStore().reset

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración" size="xl">
      <div className="flex gap-4">
        <nav className="flex w-40 shrink-0 flex-col gap-1 border-r border-border-default pr-3">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex cursor-pointer items-center gap-2 rounded-button px-3 py-2 text-left text-content transition-colors ${
                tab === id
                  ? 'bg-bg-info text-fg-brand font-medium'
                  : 'text-fg-muted hover:bg-bg-muted'
              }`}
            >
              <Icon size={20} weight="duotone" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 max-h-[70vh] overflow-y-auto pr-1">
          {tab === 'profile' && <ProfileTab />}
          {tab === 'appearance' && <AppearanceTab />}
          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'privacy' && <PrivacyTab />}

          <div className="mt-6 flex justify-between border-t border-border-default pt-4">
            <Button variant="ghost" onClick={reset}>
              <ArrowCounterClockwise size={20} weight="duotone" /> Restablecer apariencia
            </Button>
            <Button onClick={onClose}>Listo</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
