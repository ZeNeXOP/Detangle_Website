import { useState } from 'react'
import type { FormEvent } from 'react'
import { slugify } from './lib/uploadFile'
import { useExistingBlogPosts } from './hooks/useExistingBlogPosts'

type PostForm = {
  title: string
  slug: string
  subtitle: string
  shortDescription: string
  content: string
  publishedAt: string
}

const EMPTY: PostForm = {
  title: '',
  slug: '',
  subtitle: '',
  shortDescription: '',
  content: '',
  publishedAt: '',
}

export default function AddBlogSection() {
  const { refetch } = useExistingBlogPosts()
  const [form, setForm] = useState<PostForm>(EMPTY)
  const [slugTouched, setSlugTouched] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = <K extends keyof PostForm>(field: K, value: PostForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleTitleChange = (value: string) => {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugTouched(true)
    updateField('slug', slugify(value))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError('')
    setSavedNotice('')

    if (!form.title.trim()) {
      setValidationError('Title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const publishedAtIso = form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined

      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug || slugify(form.title),
          title: form.title.trim(),
          subtitle: form.subtitle,
          short_description: form.shortDescription,
          content: form.content,
          published_at: publishedAtIso,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Failed to create post.')
      }

      setSavedNotice(`"${form.title}" saved.`)
      setForm(EMPTY)
      setSlugTouched(false)
      refetch()
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="admin-event-form" onSubmit={handleSubmit}>
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">New Blog Post</h2>
        <p className="admin-form-section-hint">Everything here is optional except Title.</p>

        <label className="admin-field">
          <span>
            Title <span className="admin-required">*</span>
          </span>
          <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
        </label>

        <label className="admin-field">
          <span>URL slug</span>
          <input type="text" value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="auto-generated-from-title" />
        </label>

        <label className="admin-field">
          <span>Subtitle</span>
          <input type="text" value={form.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} />
        </label>

        <label className="admin-field">
          <span>Date &amp; Time</span>
          <input
            type="datetime-local"
            value={form.publishedAt}
            onChange={(e) => updateField('publishedAt', e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Short Description</span>
          <textarea
            rows={2}
            value={form.shortDescription}
            onChange={(e) => updateField('shortDescription', e.target.value)}
            placeholder="Shown on the blog listing card"
          />
        </label>

        <label className="admin-field">
          <span>Blog Content</span>
          <p className="admin-form-section-hint">
            Leave a blank line between paragraphs. Use **bold** and *italic* for emphasis, and start
            a line with "- " or "* " for a bullet list.
          </p>
          <textarea
            rows={12}
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="The full article — leave a blank line between paragraphs. **bold** and *italic* are supported."
          />
        </label>
      </section>

      {validationError && <p className="admin-error">{validationError}</p>}
      {savedNotice && <p className="admin-notice">{savedNotice}</p>}

      <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save Post'}
      </button>
    </form>
  )
}
