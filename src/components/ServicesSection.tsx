import { useEffect, useRef, useState } from 'react'
import ServiceCard from './ServiceCard'

const services = [
  {
    title: 'Therapy Sessions',
    description:
      'One-on-one sessions tailored to your needs—stress, overthinking, relationship concerns, and self-growth. Available both in person and online, so support fits your space and schedule.',
  },
  {
    title: 'Reiki Sessions',
    description:
      'A gentle, hands-on energy healing practice that helps release blocked energy, ease stress, and restore a sense of calm and balance.',
  },
  {
    title: 'Sound Healing Sessions',
    description:
      'Guided sessions using sound and vibration—singing bowls, tones, and resonance—to calm the nervous system and support deep relaxation.',
  },
  {
    title: 'Aura Cleansing Sessions',
    description:
      "A focused practice to clear what you're carrying in your energy field, so you can feel lighter, clearer, and more like yourself again.",
  },
  {
    title: 'Chakra Balancing Sessions',
    description:
      "Work with the body's seven energy centres to release blockages and restore flow—supporting emotional, physical, and mental wellbeing.",
  },
  {
    title: 'Dedicated Programs',
    description:
      'Structured, multi-week journeys combining group work, individual sessions, and reflective practice—built around a specific theme or goal.',
  },
  {
    title: 'Workshops & Events',
    description:
      'Interactive, activity-based sessions on emotional regulation, self-awareness, procrastination, and more—often using creative approaches like expressive art therapy.',
  },
  {
    title: 'Group Sessions',
    description:
      'A shared space to connect, reflect, and grow with others—while maintaining a safe and respectful environment.',
  },
]

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
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              index={index}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
