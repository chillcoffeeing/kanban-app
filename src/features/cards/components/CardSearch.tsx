import { useState, useMemo, useRef, useEffect } from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useBoardStore } from "@/stores/boardStore";
import type { Card, Stage } from "@/shared/types/domain";

interface CardSearchProps {
  boardId: string;
  onSelectCard: (card: Card, stageId: string) => void;
}

interface Match {
  card: Card;
  stage: Stage;
}

export function CardSearch({ onSelectCard }: CardSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const board = useBoardStore((boardState) => boardState.currentBoard);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = useMemo<Match[]>(() => {
    if (!query.trim() || !board) return [];
    const q = query.toLowerCase();
    const matches: Match[] = [];
    for (const stage of board.stages) {
      for (const card of stage.cards) {
        const matchTitle = card.title.toLowerCase().includes(q);
        const matchDesc = card.description?.toLowerCase().includes(q);
        const matchLabel = card.labels?.some((label) =>
          label.name.toLowerCase().includes(q),
        );
        const matchMember = card.members?.some((member) =>
          member.boardMembership?.user?.name?.toLowerCase().includes(q) || false,
        );
        const matchChecklist = card.checklist?.some((checkItem) =>
          checkItem.text.toLowerCase().includes(q),
        );

        if (
          matchTitle ||
          matchDesc ||
          matchLabel ||
          matchMember ||
          matchChecklist
        ) {
          matches.push({ card, stage });
        }
      }
    }
    return matches;
  }, [query, board]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5">
        <MagnifyingGlassIcon size={20} weight="duotone" className="text-white/70" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar tarjetas..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          className="w-40 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none focus:w-56 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <XIcon size={18} weight="bold" />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
          <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-neutral-light bg-surface shadow-lg">
             <div className="border-b border-neutral-light px-3 py-2">
             <span className="text-xs font-medium text-neutral-dark">
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-neutral-dark">
                Sin resultados para "{query}"
              </div>
            ) : (
              results.map(({ card, stage }) => (
                <button
                  key={card.id}
                  onClick={() => {
                    onSelectCard(card, stage.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full cursor-pointer flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-neutral-light/50"
                >
                  <div className="flex items-center gap-2">
                    {card.labels?.length > 0 && (
                      <div className="flex gap-0.5">
                        {card.labels.slice(0, 3).map((label) => (
                          <span
                            key={label.color}
                            className="h-1.5 w-4 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                        ))}
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-dark truncate">
                      {card.title}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-dark/60">
                    en{" "}
                    <span className="font-medium text-neutral-dark/70">
                      {stage.name}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
