type ToolCardProps = {
  href: string
  title: string
  description: string
  badge: string
}

export function ToolCard({ href, title, description, badge }: ToolCardProps) {
  return (
    <a className="tool-card" href={href}>
      <span className="tool-card-badge">{badge}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </a>
  )
}
