type ServiceCardProps = {
  title: string
  description: string
  variant: 'therapy' | 'online' | 'workshops' | 'groups'
  index: number
  visible: boolean
}

export default function ServiceCard({
  title,
  description,
  variant,
  index,
  visible,
}: ServiceCardProps) {
  return (
    <article
      className={`service-card service-card--${variant} ${
        visible ? 'service-card--visible' : ''
      }`}
      style={{ transitionDelay: visible ? `${index * 120}ms` : '0ms' }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

