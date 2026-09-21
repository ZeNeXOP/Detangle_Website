import { useEffect, useState } from 'react'
import type { Event } from '../../types'

export function useExistingEvents() {
  const [events, setEvents] = useState<Event[] | null>(null)

  const refetch = () => {
    fetch('/api/events')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Event[]) => setEvents(data))
      .catch(() => setEvents([]))
  }

  useEffect(() => {
    refetch()
  }, [])

  const upcomingCount = events?.filter((event) => event.status === 'upcoming').length ?? 0

  return { events, refetch, upcomingCount }
}
