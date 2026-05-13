import { useEffect, useState } from "react";
import { getYear } from "date-fns";

export function Footer() {
  const [year, setYear] = useState(getYear(new Date()));

  useEffect(() => {
    setYear(getYear(new Date()));
  }, []);

  return (
    <footer className="border-t border-neutral-light bg-surface py-6">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex flex-col items-center gap-2 text-sm text-neutral-dark/70">
          <p className="text-base font-semibold text-neutral-dark">Kanban</p>
          <p>Organiza tus proyectos de forma eficiente</p>
          <div className="flex items-center gap-2 mt-2">
            <span>&copy; {year}</span>
            <span>&middot;</span>
            <span>Todos los derechos reservados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
