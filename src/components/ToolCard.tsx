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
      <div className="tool-card-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="tool-card-content">
        <span className="tool-card-badge">{badge}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <ArrowRight className="tool-card-arrow" size={19} strokeWidth={1.7} aria-hidden="true" />
    </button>
  )
}
