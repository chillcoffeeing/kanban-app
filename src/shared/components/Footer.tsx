import { useMemo } from 'react';

export function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  
  return (
    <footer className="border-t border-border-subtle bg-bg-card py-4">
      <div className="flex items-center justify-center gap-2 text-sm text-surface-400">
        <span>Canvan</span>
        <span>&middot;</span>
        <span>Organiza tus proyectos</span>
        <span>&middot;</span>
        <span>{year}</span>
      </div>
    </footer>
  )
}
