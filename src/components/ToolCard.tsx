import type { ComponentType } from 'react'
import { ArrowRight } from 'lucide-react'

type ToolCardProps = {
  onClick: () => void
  title: string
  description: string
  badge: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

export function ToolCard({ onClick, title, description, badge, Icon }: ToolCardProps) {
  return (
    <button className="tool-card" onClick={onClick} type="button">
      <span className="tool-card-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={2} />
      </span>
      <span className="tool-card-content">
        <span className="tool-card-badge">{badge}</span>
        <span className="tool-card-title">{title}</span>
        <span className="tool-card-description">{description}</span>
      </span>
      <ArrowRight className="tool-card-arrow" size={19} strokeWidth={1.7} aria-hidden="true" />
    </button>
  )
}
