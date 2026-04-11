import type { ReactNode } from "react"

type AppShellProps = {
  title: string
  children: ReactNode
}

export default function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>{title}</h1>
          <p>Kişisel otomasyon paneli</p>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  )
}