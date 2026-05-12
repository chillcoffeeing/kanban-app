import { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  MoonStarsIcon,
  PaletteIcon,
  SquaresFourIcon,
  DotsNineIcon,
  GridFourIcon,
  XIcon,
  MinusIcon,
  PlusIcon,
  PaintBrushBroadIcon,
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  LightningIcon,
  CheckCircleIcon,
  FloppyDiskIcon,
  ArrowCounterClockwiseIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  useSettingsStore,
  BACKGROUNDS,
} from "@/stores/settingsStore";
import { Button } from "@/shared/components/Button";

const THEME_OPTIONS: Array<{ id: string; label: string; Icon: PhosphorIcon }> = [
  { id: "light", label: "Claro", Icon: SunIcon },
  { id: "dark", label: "Oscuro", Icon: MoonIcon },
  { id: "midnight", label: "Medianoche", Icon: MoonStarsIcon },
  { id: "solarized", label: "Solarized", Icon: PaletteIcon },
];

const BG_ICONS: Record<string, PhosphorIcon> = {
  plain: SquaresFourIcon,
  dots: DotsNineIcon,
  grid: GridFourIcon,
  crosshatch: XIcon,
  diagonal: MinusIcon,
  plus: PlusIcon,
};

function Section({ title, description, icon: Icon, children }: { title: string; description?: string; icon?: PhosphorIcon; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
        {Icon && <Icon size={20} weight="duotone" className="text-primary/70" />}
        {title}
      </h3>
      {description && <p className="mb-4 text-sm text-neutral-dark/60">{description}</p>}
      {children}
    </section>
  );
}

function Row({ icon: Icon, title, description, children }: { icon?: PhosphorIcon; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-light bg-neutral-light/30 p-3 hover:bg-neutral-light-hover transition-colors">
      <div className="flex items-start gap-3">
        {Icon && <Icon size={22} weight="duotone" className="mt-0.5 text-primary" />}
        <div>
          <p className="text-sm font-medium text-neutral-dark">{title}</p>
          {description && <p className="mt-0.5 text-xs text-neutral-dark/60">{description}</p>}
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
  } as Record<string, any>);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Apply preview in real-time without saving
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = form.theme;
    root.dataset.density = form.density;
    root.dataset.reducedMotion = String(form.reducedMotion);
    root.lang = form.language;
    document.body.dataset.bg = form.background;
  }, [form.theme, form.background, form.density, form.reducedMotion, form.language]);

  const set = (key: string, value: any) => {
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

  // Sync form from store when user resets or navigates away
  useEffect(() => {
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
  }, [store.theme, store.background, store.density, store.language, store.timezone, store.timeFormat, store.dateFormat, store.reducedMotion, store.showCompletedCards]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await store.apply({
        theme: form.theme,
        background: form.background,
        density: form.density,
        language: form.language,
        timezone: form.timezone,
        timeFormat: form.timeFormat,
        dateFormat: form.dateFormat,
        reducedMotion: form.reducedMotion,
        showCompletedCards: form.showCompletedCards,
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
      <div className="flex items-center gap-3">
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
          <span className="text-content text-success">Apariencia guardada correctamente</span>
        )}
      </div>
      <Section title="Tema" description="Paleta de colores de la interfaz." icon={SunIcon}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = form.theme === id;
            return (
              <button
                key={id}
                onClick={() => set("theme", id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-neutral-light bg-surface text-neutral-dark/70 hover:border-neutral-light hover:bg-neutral-light/30"
                }`}
              >
                <Icon size={28} weight={active ? "fill" : "duotone"} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Fondo" icon={PaintBrushBroadIcon}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BACKGROUNDS.map(({ id, label }) => {
            const Icon = BG_ICONS[id] || SquaresFourIcon;
            const active = form.background === id;
            return (
              <button
                key={id}
                onClick={() => set("background", id)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-sm transition-colors cursor-pointer ${
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-neutral-light bg-surface text-neutral-dark/70 hover:border-neutral-light hover:bg-neutral-light/30"
                }`}
              >
                <Icon size={22} weight="duotone" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Densidad" icon={ArrowsOutSimpleIcon}>
        <div className="flex gap-2">
          <button
            onClick={() => set("density", "comfortable")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm cursor-pointer ${
                  form.density === "comfortable"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-neutral-light text-neutral-dark/70 hover:border-neutral-light hover:bg-neutral-light/30"
                }`}
          >
            <ArrowsOutSimpleIcon size={22} weight="duotone" /> Cómoda
          </button>
          <button
            onClick={() => set("density", "compact")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-sm cursor-pointer ${
                  form.density === "compact"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-neutral-light text-neutral-dark/70 hover:border-neutral-light hover:bg-neutral-light/30"
                }`}
          >
            <ArrowsInSimpleIcon size={22} weight="duotone" /> Compacta
          </button>
        </div>
      </Section>

      <Section title="Idioma y formato" icon={GlobeIcon}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-dark/70">Idioma</span>
              <select
                value={form.language}
                onChange={(e) => set("language", e.target.value)}
                className="rounded-lg border border-neutral-light bg-neutral-light/50 px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-dark/70">Zona horaria</span>
              <input
                value={form.timezone || ""}
                onChange={(e) => set("timezone", e.target.value)}
                className="rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm text-neutral-dark placeholder:text-neutral-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="America/Caracas"
              />
           </label>
          <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-dark/70">Formato de hora</span>
              <select
                value={form.timeFormat}
                onChange={(e) => set("timeFormat", e.target.value)}
                className="rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               >
               <option value="es">Español</option>
               <option value="en">English</option>
             </select>
           </label>
           <label className="flex flex-col gap-1">
               <span className="text-xs font-medium text-neutral-dark/70">Zona horaria</span>
               <input
                 value={form.timezone || ""}
                 onChange={(e) => set("timezone", e.target.value)}
                 className="rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm text-neutral-dark placeholder:text-neutral-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                 placeholder="America/Caracas"
               />
           </label>
           <label className="flex flex-col gap-1">
               <span className="text-xs font-medium text-neutral-dark/70">Formato de hora</span>
               <select
                 value={form.timeFormat}
                onChange={(e) => set("timeFormat", e.target.value)}
                 className="rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               >
               <option value="24h">24h</option>
               <option value="12h">12h (AM/PM)</option>
             </select>
           </label>
           <label className="flex flex-col gap-1">
               <span className="text-xs font-medium text-neutral-dark/70">Formato de fecha</span>
               <select
                 value={form.dateFormat}
                 onChange={(e) => set("dateFormat", e.target.value)}
                 className="rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
               >
               <option value="DMY">DD/MM/AAAA</option>
               <option value="MDY">MM/DD/AAAA</option>
               <option value="YMD">AAAA-MM-DD</option>
             </select>
           </label>
         </div>
       </Section>

      <Section title="Accesibilidad y comportamiento" icon={LightningIcon}>
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
              className="size-4 rounded border-neutral-light"
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
              className="size-4 rounded border-neutral-light"
            />
          </Row>
        </div>
      </Section>
    </div>
  );
}
