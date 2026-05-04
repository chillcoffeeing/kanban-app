import { useState } from "react";
import {
  SunIcon,
  MoonIcon,
  MoonStarsIcon,
  PaletteIcon,
  SquaresFourIcon,
  DotsNineIcon,
  GridFourIcon,
  PaintBrushBroadIcon,
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  LightningIcon,
  CheckCircleIcon,
  FloppyDiskIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  useSettingsStore,
  BACKGROUNDS,
} from "@/stores/settingsStore";
import type { UserDisplayPrefs } from "@/shared/types/user";
import { Button } from "@/shared/components/Button";

const THEME_OPTIONS: Array<{ id: UserDisplayPrefs["theme"]; label: string; Icon: PhosphorIcon }> = [
  { id: "light", label: "Claro", Icon: SunIcon },
  { id: "dark", label: "Oscuro", Icon: MoonIcon },
  { id: "midnight", label: "Medianoche", Icon: MoonStarsIcon },
  { id: "solarized", label: "Solarized", Icon: PaletteIcon },
];

const BG_ICONS: Record<string, PhosphorIcon> = {
  plain: SquaresFourIcon,
  dots: DotsNineIcon,
  grid: GridFourIcon,
  "gradient-blue": PaintBrushBroadIcon,
  "gradient-sunset": PaintBrushBroadIcon,
  "gradient-forest": PaintBrushBroadIcon,
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
  const store = useSettingsStore();
  const [form, setForm] = useState({
    theme: store.theme,
    background: store.background,
    density: store.density,
    language: store.language,
    timezone: store.timezone,
    timeFormat: store.timeFormat,
    dateFormat: store.dateFormat,
    reducedMotion: store.reducedMotion,
    showCompletedCards: store.showCompletedCards,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const hasChanges =
    form.theme !== store.theme ||
    form.background !== store.background ||
    form.density !== store.density ||
    form.language !== store.language ||
    form.timezone !== store.timezone ||
    form.timeFormat !== store.timeFormat ||
    form.dateFormat !== store.dateFormat ||
    form.reducedMotion !== store.reducedMotion ||
    form.showCompletedCards !== store.showCompletedCards;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await store.apply({
        display: {
          theme: form.theme,
          background: form.background,
          density: form.density,
          language: form.language,
          timezone: form.timezone,
          timeFormat: form.timeFormat,
          dateFormat: form.dateFormat,
          reducedMotion: form.reducedMotion,
          showCompletedCards: form.showCompletedCards,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      theme: store.theme,
      background: store.background,
      density: store.density,
      language: store.language,
      timezone: store.timezone,
      timeFormat: store.timeFormat,
      dateFormat: store.dateFormat,
      reducedMotion: store.reducedMotion,
      showCompletedCards: store.showCompletedCards,
    });
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <Section title="Tema" description="Paleta de colores de la interfaz.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = form.theme === id;
            return (
              <button
                key={id}
                onClick={() => set("theme", id)}
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
            const Icon = BG_ICONS[id] || SquaresFourIcon;
            const active = form.background === id;
            return (
              <button
                key={id}
                onClick={() => set("background", id)}
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
            onClick={() => set("density", "comfortable")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-card border p-3 text-content cursor-pointer ${
              form.density === "comfortable"
                ? "border-border-focus bg-bg-info text-fg-brand"
                : "border-border-default text-fg-muted hover:border-border-strong"
            }`}
          >
            <ArrowsOutSimpleIcon size={22} weight="duotone" /> Cómoda
          </button>
          <button
            onClick={() => set("density", "compact")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-card border p-3 text-content cursor-pointer ${
              form.density === "compact"
                ? "border-border-focus bg-bg-info text-fg-brand"
                : "border-border-default text-fg-muted hover:border-border-strong"
            }`}
          >
            <ArrowsInSimpleIcon size={22} weight="duotone" /> Compacta
          </button>
        </div>
      </Section>

      <Section title="Idioma y formato">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Idioma</span>
            <select
              value={form.language}
              onChange={(e) => set("language", e.target.value as UserDisplayPrefs["language"])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Zona horaria</span>
            <input
              value={form.timezone || ""}
              onChange={(e) => set("timezone", e.target.value)}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default placeholder:text-fg-subtle focus:border-border-focus focus:outline-none"
              placeholder="America/Caracas"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Formato de hora</span>
            <select
              value={form.timeFormat}
              onChange={(e) => set("timeFormat", e.target.value as UserDisplayPrefs["timeFormat"])}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default"
            >
              <option value="24h">24h</option>
              <option value="12h">12h (AM/PM)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-card-meta font-medium text-fg-muted">Formato de fecha</span>
            <select
              value={form.dateFormat}
              onChange={(e) => set("dateFormat", e.target.value as UserDisplayPrefs["dateFormat"])}
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
            icon={LightningIcon}
            title="Reducir animaciones"
            description="Desactiva transiciones no esenciales."
          >
            <input
              type="checkbox"
              checked={form.reducedMotion}
              onChange={(e) => set("reducedMotion", e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </Row>
          <Row
            icon={CheckCircleIcon}
            title="Mostrar tarjetas completadas"
            description="Incluir tarjetas finalizadas en las listas."
          >
            <input
              type="checkbox"
              checked={form.showCompletedCards}
              onChange={(e) => set("showCompletedCards", e.target.checked)}
              className="h-4 w-4 rounded border-border-default"
            />
          </Row>
        </div>
      </Section>

      <div className="flex items-center gap-3 pt-4 border-t border-border-default">
        <Button variant="primary" onClick={handleSave} disabled={saving || !hasChanges}>
          <FloppyDiskIcon size={20} weight="duotone" />
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
        {hasChanges && (
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            <ArrowCounterClockwiseIcon size={20} weight="duotone" /> Descartar
          </Button>
        )}
        {saved && (
          <span className="text-content text-fg-success">Apariencia guardada correctamente</span>
        )}
      </div>
    </div>
  );
}
