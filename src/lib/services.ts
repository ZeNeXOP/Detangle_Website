// The 5 bookable services — the rest (Group Sessions, Dedicated Programs,
// Workshops & Events) are scheduled Events instead, and are booked through
// the "Upcoming Events" half of the same dropdown. Keep this in sync with
// backend/constants.py.
export type BookableServiceType =
  | 'therapy_session'
  | 'reiki_session'
  | 'sound_healing_session'
  | 'aura_cleansing_session'
  | 'chakra_balancing_session'

export const BOOKABLE_SERVICES: { value: BookableServiceType; label: string }[] = [
  { value: 'therapy_session', label: 'Therapy Session' },
  { value: 'reiki_session', label: 'Reiki Session' },
  { value: 'sound_healing_session', label: 'Sound Healing Session' },
  { value: 'aura_cleansing_session', label: 'Aura Cleansing Session' },
  { value: 'chakra_balancing_session', label: 'Chakra Balancing Session' },
]

export const SERVICE_LABELS: Record<BookableServiceType, string> = Object.fromEntries(
  BOOKABLE_SERVICES.map((service) => [service.value, service.label])
) as Record<BookableServiceType, string>

/** Builds the wa.me link that opens WhatsApp with a pre-filled message to Noopur. */
export function buildWhatsAppLink(message: string): string {
  const number = import.meta.env.VITE_NOOPUR_WHATSAPP_NUMBER ?? ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
