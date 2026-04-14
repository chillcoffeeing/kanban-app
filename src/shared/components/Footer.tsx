export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white py-4">
      <div className="flex items-center justify-center gap-2 text-sm text-surface-400">
        <span>Canvan</span>
        <span>&middot;</span>
        <span>Organiza tus proyectos</span>
        <span>&middot;</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
