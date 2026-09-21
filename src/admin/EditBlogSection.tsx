import { useState } from 'react'
import type { FormEvent } from 'react'
import type { BlogPost } from '../types'
import { isoToDatetimeLocal } from '../lib/formatEventDate'
import { useExistingBlogPosts } from './hooks/useExistingBlogPosts'

type EditForm = {
  title: string
  subtitle: string
  shortDescription: string
  content: string
  publishedAt: string
}

export default function EditBlogSection() {
  const { posts, refetch } = useExistingBlogPosts()
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<EditForm | null>(null)
  const [validationError, setValidationError] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPost = posts?.find((p) => p.id === selectedId) ?? null

  const handleSelectChange = (id: string) => {
    if (!id) {
      setSelectedId('')
      setForm(null)
      return
    }
    const post = posts?.find((p) => p.id === id)
    if (!post) return

    setSelectedId(id)
    setForm({
      title: post.title,
      subtitle: post.subtitle ?? '',
      shortDescription: post.short_description ?? '',
      content: post.content ?? '',
      publishedAt: isoToDatetimeLocal(post.published_at),
    })
    setValidationError('')
    setSavedNotice('')
  }

  const updateField = <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError('')
    setSavedNotice('')

    if (!selectedPost || !form) {
      setValidationError('Select a post to edit first.')
      return
    }
    if (!form.title.trim()) {
      setValidationError('Title is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const publishedAtIso = form.publishedAt ? new Date(form.publishedAt).toISOString() : null

      const response = await fetch(`/api/admin/blog/${selectedPost.slug}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle,
          short_description: form.shortDescription,
          content: form.content,
          published_at: publishedAtIso,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Failed to update post.')
      }

      setSavedNotice(`"${form.title}" updated.`)
      refetch()
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-event-form">
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Edit Blog Post</h2>
        <p className="admin-form-section-hint">Pick a post to update its details.</p>

        <label className="admin-field">
          <span>Select Post</span>
          <select value={selectedId} onChange={(e) => handleSelectChange(e.target.value)}>
            <option value="">{posts === null ? 'Loading posts…' : '— Select a post —'}</option>
            {posts?.map((post: BlogPost) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
          {posts && posts.length === 0 && <p className="admin-form-section-hint">No posts exist yet — add one first.</p>}
        </label>
      </section>

      {form && (
        <form onSubmit={handleSubmit}>
          <section className="admin-form-section">
            <label className="admin-field">
              <span>
                Title <span className="admin-required">*</span>
              </span>
              <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} />
            </label>

            <label className="admin-field">
              <span>URL slug</span>
              <input type="text" value={selectedPost?.slug ?? ''} disabled />
              <p className="admin-form-section-hint">Slug can't be changed after creation.</p>
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
              />
            </label>

            <label className="admin-field">
              <span>Blog Content</span>
              <textarea rows={12} value={form.content} onChange={(e) => updateField('content', e.target.value)} />
            </label>
          </section>

          {validationError && <p className="admin-error">{validationError}</p>}
          {savedNotice && <p className="admin-notice">{savedNotice}</p>}

          <button type="submit" className="admin-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  )
}
