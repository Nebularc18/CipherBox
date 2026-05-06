import type { ComponentType } from 'react'
import { ArrowRight } from 'lucide-react'

type ToolCardProps = {
  href: string
  title: string
  description: string
  badge: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

export function ToolCard({ href, title, description, badge, Icon }: ToolCardProps) {
  return (
    <a className="tool-card" href={href}>
      <span className="tool-card-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={2} />
      </span>
      <div>
        <span className="tool-card-badge">{badge}</span>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
      <ArrowRight className="tool-card-arrow" size={19} strokeWidth={1.7} aria-hidden="true" />
    </a>
  )
}
