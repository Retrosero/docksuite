import type { ReactNode } from 'react'

type PageSectionProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function PageSection({ title, subtitle, children }: PageSectionProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  )
}
