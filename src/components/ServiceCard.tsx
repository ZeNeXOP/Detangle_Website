type ServiceCardProps = {
  title: string
  description: string
  index: number
  visible: boolean
}

export default function ServiceCard({ title, description, index, visible }: ServiceCardProps) {
  return (
    <article
      className={`service-card ${visible ? 'service-card--visible' : ''}`}
      style={{ transitionDelay: visible ? `${index * 90}ms` : '0ms' }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
