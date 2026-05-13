import { useReducer } from "react";
import { PlusIcon, TagIcon, TrashIcon, CheckIcon } from "@phosphor-icons/react";
import { LABEL_COLORS } from "@/shared/utils/constants";
import type { Label } from "@/shared/types/domain";

interface LabelEditorProps {
  labels: Label[];
  onToggle: (label: Label) => void;
  onCreate: (name: string, color: string) => void;
}

type FormState = {
  adding: boolean;
  name: string;
  color: string;
  customColor: string;
  useCustom: boolean;
};

const INITIAL: FormState = {
  adding: false,
  name: "",
  color: LABEL_COLORS[0].value,
  customColor: "#3b82f6",
  useCustom: false,
};

type Action =
  | { type: "open" }
  | { type: "setName"; name: string }
  | { type: "setColor"; color: string }
  | { type: "setCustomColor"; customColor: string }
  | { type: "setUseCustom" }
  | { type: "reset" };

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "open":
      return { ...state, adding: true };
    case "setName":
      return { ...state, name: action.name };
    case "setColor":
      return { ...state, color: action.color, useCustom: false };
    case "setCustomColor":
      return { ...state, customColor: action.customColor, useCustom: true };
    case "setUseCustom":
      return { ...state, useCustom: true };
    case "reset":
      return { ...INITIAL };
  }
}

export function LabelEditor({ labels, onToggle, onCreate }: LabelEditorProps) {
  const [form, dispatch] = useReducer(formReducer, INITIAL);

  const submit = () => {
    const finalName = form.name.trim();
    const finalColor = form.useCustom ? form.customColor : form.color;
    if (!finalName) return;
    if (labels.find((existingLabel) => existingLabel.color === finalColor))
      return;
    onCreate(finalName, finalColor);
    dispatch({ type: "reset" });
  };

  const remove = (label: Label) => onToggle(label);

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-medium text-neutral-dark/70">
        <TagIcon size={16} weight="duotone" /> Etiquetas
      </p>

      {labels.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1.5">
          {labels.map((label) => (
            <li
              key={label.id}
              className="group flex items-center gap-2 rounded-full px-2.5 py-1 text-xs text-white shadow-sm"
              style={{ backgroundColor: label.color }}
            >
              <span className="flex-1 truncate font-medium">{label.name}</span>
              <button
                onClick={() => remove(label)}
                className="cursor-pointer rounded-sm p-0.5 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/20 hover:text-white"
                title="Quitar etiqueta"
              >
                <TrashIcon size={14} weight="duotone" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!form.adding ? (
        <button
          onClick={() => dispatch({ type: "open" })}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-neutral-light bg-neutral-light/30 px-2 py-1.5 text-xs text-neutral-dark/70 transition-all hover:border-primary hover:bg-neutral-light-hover hover:text-neutral-dark"
        >
          <PlusIcon size={16} weight="duotone" /> Añadir etiqueta
        </button>
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-light bg-surface p-4 shadow-sm hover:shadow-md transition-all">
          <input
            type="text"
            placeholder="Título de la etiqueta"
            value={form.name}
            onChange={(e) => dispatch({ type: "setName", name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") dispatch({ type: "reset" });
            }}
            className="w-full rounded-lg border border-neutral-light bg-neutral-light/50 px-2 py-1 text-xs text-neutral-dark placeholder:text-neutral-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />

          <div className="flex flex-wrap gap-1">
            {LABEL_COLORS.map((colorOption) => {
              const active = !form.useCustom && form.color === colorOption.value;
              return (
                <button
                  key={colorOption.value}
                  onClick={() => dispatch({ type: "setColor", color: colorOption.value })}
                  title={colorOption.name}
                  className={`flex size-6 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 ${
                    active
                      ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-neutral-light"
                      : ""
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                >
                  {active && (
                    <CheckIcon
                      size={12}
                      weight="bold"
                      className="text-primary-fg"
                    />
                  )}
                </button>
              );
            })}
            <label
              title="Color personalizado"
              className={`flex size-6 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-105 ${
                form.useCustom
                  ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-neutral-light"
                  : ""
              }`}
              style={{
                background:
                  "conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
              }}
            >
              <input
                type="color"
                value={form.customColor}
                onChange={(e) => dispatch({ type: "setCustomColor", customColor: e.target.value })}
                className="absolute size-0 opacity-0"
              />
            </label>
          </div>

          {form.useCustom && (
            <div className="flex items-center gap-2 text-xs text-neutral-dark/70">
              <span
                className="size-4 rounded-full"
                style={{ backgroundColor: form.customColor }}
              />
              <code className="font-mono">{form.customColor}</code>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={!form.name.trim()}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              <CheckIcon size={14} weight="bold" /> Crear
            </button>
            <button
              onClick={() => dispatch({ type: "reset" })}
              className="cursor-pointer rounded-lg bg-neutral-light/70 px-2 py-1 text-xs font-medium text-neutral-dark/70 hover:bg-neutral-light-hover transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
