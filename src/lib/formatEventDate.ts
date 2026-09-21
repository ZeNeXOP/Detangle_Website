import type { Event } from '../types'

export function formatEventDate(isoDateTime: string): string {
  try {
    const date = new Date(isoDateTime)
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return isoDateTime
  }
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  therapy_session: 'Therapy Session',
  online_session: 'Online Session',
  group_session: 'Group Session',
  program: 'Program',
}

export function formatEventEyebrow(event: Pick<Event, 'type' | 'start_datetime'>): string {
  const parts: string[] = []
  if (event.type) {
    parts.push(EVENT_TYPE_LABELS[event.type] ?? event.type)
  }
  if (event.start_datetime) {
    parts.push(formatEventDate(event.start_datetime))
  }
  return parts.join(' · ')
}

export function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
