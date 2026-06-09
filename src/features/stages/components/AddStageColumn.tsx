// Libraries
import { useState } from "react";
import type { FormEvent } from "react";

// Components
import { Button } from "@/shared/components/Button";

// Icons
import { PlusIcon } from "@phosphor-icons/react";

interface AddStageColumnProps {
  onAddStage: (name: string) => void;
}

export function AddStageColumn({ onAddStage }: AddStageColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddStage(name.trim());
    setName("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex w-72 h-full shrink-0 cursor-pointer items-center gap-2 py-2 justify-center rounded-xl border-2 border-dashed border-secondary text-sm font-medium text-secondary hover:bg-secondary hover:text-secondary-fg transition-colors"
      >
        <PlusIcon size={28} weight="duotone" /> Añadir etapa
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-72 shrink-0 rounded-xl border border-neutral-light bg-surface p-[var(--density-padding,1rem)] shadow-sm animate-scaleIn"
    >
      <input
        placeholder="Nombre de la etapa..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setIsAdding(false)}
        className="mb-3 w-full rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
      <div className="flex gap-[var(--density-gap,0.5rem)]">
        <Button size="sm" type="submit">
          Añadir etapa
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => setIsAdding(false)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
