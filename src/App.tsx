import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Header } from '@/shared/components/Header'
import { Footer } from '@/shared/components/Footer'
import { SettingsPanel } from '@/shared/components/SettingsPanel'
import { useApplySettings } from '@/shared/hooks/useApplySettings'
import { AuthPage } from '@/pages/AuthPage'
import { BoardsPage } from '@/pages/BoardsPage'
import { BoardView } from '@/pages/BoardView'

type View = 'boards' | 'board' | 'settings'

function App() {
  useApplySettings()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const [currentView, setCurrentView] = useState<View>('boards')
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!isAuthenticated) {
    return <AuthPage />
  }

  const handleNavigate = (view: View) => {
    if (view === 'settings') {
      setSettingsOpen(true)
      return
    }
    setCurrentView(view)
    if (view === 'boards') setSelectedBoardId(null)
  }

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId)
    setCurrentView('board')
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[var(--container-app)] flex-col">
      <Header onNavigate={handleNavigate} currentView={currentView} />
      <main className="flex flex-1 flex-col">
        {currentView === 'boards' && (
          <BoardsPage onSelectBoard={handleSelectBoard} />
        )}
        {currentView === 'board' && selectedBoardId && (
          <BoardView boardId={selectedBoardId} />
        )}
      </main>
      {currentView === 'boards' && <Footer />}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}

export default App
