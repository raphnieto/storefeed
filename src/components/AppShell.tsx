import type { ReactNode } from 'react'
import '../styles/appShell.css'

type AppShellProps = {
  children: ReactNode
  surfaceClassName?: string
  aside?: ReactNode
  showEntryProgress?: boolean
}

export function AppShell({
  children,
  surfaceClassName = '',
  aside,
  showEntryProgress = false,
}: AppShellProps) {
  const surfaceClass = ['app-shell__surface', surfaceClassName]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="app-frame">
      <div className="app-shell">
        {showEntryProgress && (
          <div className="feed-entry-progress" aria-hidden>
            <span className="feed-entry-progress__fill" />
          </div>
        )}
        <div className={surfaceClass}>{children}</div>
        {aside}
      </div>
    </div>
  )
}
