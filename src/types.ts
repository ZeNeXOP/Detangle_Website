export type EventType = 'workshop' | 'therapy_session' | 'online_session' | 'group_session' | 'program'

export type Event = {
  id: string
  slug: string
  title: string
  short_description: string
  long_description: string
  type: EventType | null
  start_datetime: string | null
  upcoming_cutoff_hours: number
  location: string
  price: number | null
  status: 'upcoming' | 'past'
  poster_url: string | null
  gallery_image_urls: string[]
  gallery_video_urls: string[]
  whatsapp_cta_text: string
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  subtitle: string
  short_description: string
  content: string
  published_at: string | null
}
