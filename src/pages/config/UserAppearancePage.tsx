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
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  useSettingsStore,
  BACKGROUNDS,
} from "@/stores/settingsStore";
import type { UserDisplayPrefs } from "@/shared/types/user";
import { Button } from "@/shared/components/Button";

const THEME_OPTIONS: Array<{ id: UserDisplayPrefs["theme"]; label: string; Icon: PhosphorIcon }> = [
  { id: "light", label: "Claro", Icon: Sun },
  { id: "dark", label: "Oscuro", Icon: Moon },
  { id: "midnight", label: "Medianoche", Icon: MoonStars },
  { id: "solarized", label: "Solarized", Icon: Palette },
];

const BG_ICONS: Record<string, PhosphorIcon> = {
  plain: SquaresFour,
  dots: DotsNine,
  grid: GridFour,
  "gradient-blue": PaintBrushBroad,
  "gradient-sunset": PaintBrushBroad,
  "gradient-forest": PaintBrushBroad,
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-1 text-content font-semibold text-fg-default">{title}</h3>
      {description && <p className="mb-3 text-card-meta text-fg-subtle">{description}</p>}
      {children}
    </section>
  );
}

function Row({ icon: Icon, title, description, children }: { icon?: PhosphorIcon; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-card border border-border-default p-3">
      <div className="flex items-start gap-2">
        {Icon && <Icon size={22} weight="duotone" className="mt-0.5 text-icon-muted" />}
        <div>
          <p className="text-content font-medium text-fg-default">{title}</p>
          {description && <p className="text-card-meta text-fg-subtle">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function UserAppearancePage() {
  const s = useSettingsStore();
  const reset = useSettingsStore().reset;

  return (
    <div className="space-y-6">
      <Section title="Tema" description="Paleta de colores de la interfaz.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = s.theme === id;
            return (
              <button
                key={id}
                onClick={() => s.setTheme(id)}
                className={`flex flex-col items-center gap-2 rounded-card border p-3 text-content transition-colors cursor-pointer ${
                  active
                    ? "border-border-focus bg-bg-info text-fg-brand"
                    : "border-border-default bg-bg-card text-fg-muted hover:border-border-strong"
                }`}
              >
                <Icon size={28} weight={active ? "fill" : "duotone"} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Fondo">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BACKGROUNDS.map(({ id, label }) => {
            const Icon = BG_ICONS[id] || SquaresFour;
            const active = s.background === id;
            return (
              <button
                key={id}
                onClick={() => s.setBackground(id)}
                className={`flex items-center gap-2 rounded-card border p-3 text-content transition-colors cursor-pointer ${
                  active
                    ? "border-border-focus bg-bg-info text-fg-brand"
                    : "border-border-default bg-bg-card text-fg-muted hover:border-border-strong"
                }`}
              >
                <Icon size={22} weight="duotone" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Densidad">
        <div className="flex gap-2">
          <button
            onClick={() => s.setDensity("comfortable")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-card border p-3 text-content cursor-pointer ${
              s.density === "comfortable"
                ? "border-border-focus bg-bg-info text-fg-brand"
                : "border-border-default text-fg-muted hover:border-border-strong"
            }`}
          >
            <ArrowsOutSimple size={22} weight="duotone" /> Cómoda
          </button>
          <button
            onClick={() => s.setDensity("compact")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-card border p-3 text-content cursor-pointer ${
              s.density === "compact"
                ? "border-border-focus bg-bg-info text-fg-brand"
                : "border-border-default text-fg-muted hover:border-border-strong"
            }`}
          >
            <ArrowsInSimple size={22} weight="duotone" /> Compacta
          </button>
        </div>
      </Section>

      <Section title="Idioma y formato">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Idioma</span>
            <select
              value={s.language}
              onChange={(e) => s.setLanguage(e.target.value as UserDisplayPrefs["language"])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Zona horaria</span>
            <input
              value={s.timezone || ""}
              onChange={(e) => s.setTimezone(e.target.value)}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default placeholder:text-fg-subtle focus:border-border-focus focus:outline-none"
              placeholder="America/Caracas"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Formato de hora</span>
            <select
              value={s.timeFormat}
              onChange={(e) => s.setTimeFormat(e.target.value as UserDisplayPrefs["timeFormat"])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="24h">24h</option>
              <option value="12h">12h (AM/PM)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Formato de fecha</span>
            <select
              value={s.dateFormat}
              onChange={(e) => s.setDateFormat(e.target.value as UserDisplayPrefs["dateFormat"])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="DMY">DD/MM/AAAA</option>
              <option value="MDY">MM/DD/AAAA</option>
              <option value="YMD">AAAA-MM-DD</option>
            </select>
          </label>
        </div>
      </Section>

      <Section title="Accesibilidad y comportamiento">
        <div className="space-y-2">
          <Row
            icon={Lightning}
            title="Reducir animaciones"
            description="Desactiva transiciones no esenciales."
          >
            <input
              type="checkbox"
              checked={s.reducedMotion}
              onChange={(e) => s.setReducedMotion(e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </Row>
          <Row
            icon={CheckCircle}
            title="Mostrar tarjetas completadas"
            description="Incluir tarjetas finalizadas en las listas."
          >
            <input
              type="checkbox"
              checked={s.showCompletedCards}
              onChange={(e) => s.setShowCompletedCards(e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </Row>
        </div>
      </Section>

      <div className="pt-4 border-t border-border-default">
        <Button variant="ghost" onClick={reset}>
          <ArrowCounterClockwise size={20} weight="duotone" /> Restablecer apariencia
        </Button>
      </div>
    </div>
  );
}