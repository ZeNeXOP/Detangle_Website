import { useEffect, useRef, useState } from 'react'
import ServiceCard from './ServiceCard'

export default function ServicesSection() {
  const servicesRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = servicesRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={servicesRef} className="services-section">
      <div className="services-inner">
        <h2 className="services-heading">Services at Detangle</h2>
        <div className="services-grid">
          <ServiceCard
            title="Therapy Sessions"
            description="One-on-one sessions tailored to your needs—stress, overthinking, relationship concerns, and self-growth. A space to be heard and supported without judgment."
            variant="therapy"
            index={0}
            visible={visible}
          />
          <ServiceCard
            title="Online Sessions"
            description="Flexible and accessible therapy from the comfort of your own space—perfect for privacy or a busy schedule."
            variant="online"
            index={1}
            visible={visible}
          />
          <ServiceCard
            title="Workshops & Events"
            description="Interactive, activity-based sessions on emotional regulation, self-awareness, procrastination, and more—often using creative approaches like expressive art therapy."
            variant="workshops"
            index={2}
            visible={visible}
          />
          <ServiceCard
            title="Group Sessions"
            description="A shared space to connect, reflect, and grow with others—while maintaining a safe and respectful environment."
            variant="groups"
            index={3}
            visible={visible}
          />
        </div>
      </div>
    </section>
  )
}

