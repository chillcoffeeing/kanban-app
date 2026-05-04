import { useState } from "react";
import { PlusIcon, TagIcon, TrashIcon, CheckIcon } from "@phosphor-icons/react";
import { LABEL_COLORS } from "@/shared/utils/constants";
import type { Label } from "@/shared/types/domain";

interface LabelEditorProps {
  labels: Label[];
  onToggle: (label: Label) => void;
  onCreate: (name: string, color: string) => void;
}

export function LabelEditor({ labels, onToggle, onCreate }: LabelEditorProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(LABEL_COLORS[0].value);
  const [customColor, setCustomColor] = useState<string>("#3b82f6");
  const [useCustom, setUseCustom] = useState(false);

  const reset = () => {
    setAdding(false);
    setName("");
    setColor(LABEL_COLORS[0].value);
    setCustomColor("#3b82f6");
    setUseCustom(false);
  };

  const submit = () => {
    const finalName = name.trim();
    const finalColor = useCustom ? customColor : color;
    if (!finalName) return;
    if (labels.find((l) => l.color === finalColor)) return;
    onCreate(finalName, finalColor);
    reset();
  };

  const remove = (label: Label) => onToggle(label);

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-card-meta font-medium text-fg-muted">
        <TagIcon size={16} weight="duotone" /> Etiquetas
      </p>

      {labels.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1">
          {labels.map((l) => (
            <li
              key={l.id}
              className="group flex items-center gap-2 rounded-badge px-2 py-1 text-card-meta text-white shadow-card"
              style={{ backgroundColor: l.color }}
            >
              <span className="flex-1 truncate font-medium">{l.name}</span>
              <button
                onClick={() => remove(l)}
                className="cursor-pointer rounded-sm p-0.5 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/20 hover:text-white"
                title="Quitar etiqueta"
              >
                <TrashIcon size={14} weight="duotone" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full cursor-pointer items-center gap-2 rounded-button border border-dashed border-border-default px-2 py-1.5 text-card-meta text-fg-muted transition-colors hover:border-border-focus hover:bg-bg-muted hover:text-fg-default"
        >
          <PlusIcon size={16} weight="duotone" /> Añadir etiqueta
        </button>
      ) : (
        <div className="flex flex-col gap-2 rounded-card border border-border-default bg-bg-card p-2">
          <input
            autoFocus
            type="text"
            placeholder="Título de la etiqueta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") reset();
            }}
            className="w-full rounded-input border border-border-default bg-bg-card px-2 py-1 text-card-meta text-fg-default placeholder:text-fg-subtle focus:border-border-focus focus:outline-none"
          />

          <div className="flex flex-wrap gap-1">
            {LABEL_COLORS.map((c) => {
              const active = !useCustom && color === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => {
                    setColor(c.value);
                    setUseCustom(false);
                  }}
                  title={c.name}
                  className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-badge transition-transform ${
                    active
                      ? "scale-110 ring-2 ring-border-focus ring-offset-1 ring-offset-bg-card"
                      : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {active && (
                    <CheckIcon size={12} weight="bold" className="text-white" />
                  )}
                </button>
              );
            })}
            <label
              title="Color personalizado"
              className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-badge transition-transform ${
                useCustom
                  ? "scale-110 ring-2 ring-border-focus ring-offset-1 ring-offset-bg-card"
                  : ""
              }`}
              style={{
                background:
                  "conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
              }}
            >
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setUseCustom(true);
                }}
                className="absolute h-0 w-0 opacity-0"
              />
            </label>
          </div>

          {useCustom && (
            <div className="flex items-center gap-2 text-card-meta text-fg-muted">
              <span
                className="h-4 w-4 rounded-badge"
                style={{ backgroundColor: customColor }}
              />
              <code className="font-mono">{customColor}</code>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={!name.trim()}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-button bg-btn-primary-bg px-2 py-1 text-card-meta font-medium text-btn-primary-fg hover:bg-btn-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckIcon size={14} weight="bold" /> Crear
            </button>
            <button
              onClick={reset}
              className="cursor-pointer rounded-button bg-btn-secondary-bg px-2 py-1 text-card-meta font-medium text-btn-secondary-fg hover:bg-btn-secondary-bg-hover"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
