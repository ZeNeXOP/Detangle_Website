import { useState } from 'react'
import { formatEventDate } from '../lib/formatEventDate'
import { useExistingBlogPosts } from './hooks/useExistingBlogPosts'

export default function DeleteBlogSection() {
  const { posts, refetch } = useExistingBlogPosts()
  const [selectedId, setSelectedId] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const selectedPost = posts?.find((p) => p.id === selectedId) ?? null

  const handleSelectChange = (id: string) => {
    setSelectedId(id)
    setError('')
    setNotice('')
  }

  const handleDelete = async () => {
    if (!selectedPost) return

    const confirmed = window.confirm(`Delete "${selectedPost.title}" permanently? This cannot be undone.`)
    if (!confirmed) return

    setIsDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/blog/${selectedPost.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Failed to delete post.')
      }
      setNotice(`"${selectedPost.title}" deleted.`)
      setSelectedId('')
      refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="admin-event-form">
      <section className="admin-form-section">
        <h2 className="admin-form-section-title">Delete Blog Post</h2>
        <p className="admin-form-section-hint">This permanently removes the post. Cannot be undone.</p>

        <label className="admin-field">
          <span>Select Post</span>
          <select value={selectedId} onChange={(e) => handleSelectChange(e.target.value)}>
            <option value="">{posts === null ? 'Loading posts…' : '— Select a post —'}</option>
            {posts?.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
          {posts && posts.length === 0 && <p className="admin-form-section-hint">No posts exist yet.</p>}
        </label>

        {selectedPost && (
          <div className="admin-delete-preview">
            <div>
              <p className="admin-form-section-title" style={{ margin: 0 }}>
                {selectedPost.title}
              </p>
              {selectedPost.published_at && (
                <p className="admin-form-section-hint">{formatEventDate(selectedPost.published_at)}</p>
              )}
            </div>
          </div>
        )}

        {error && <p className="admin-error">{error}</p>}
        {notice && <p className="admin-notice">{notice}</p>}

        <button
          type="button"
          className="admin-submit-btn admin-submit-btn--danger"
          disabled={!selectedPost || isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? 'Deleting…' : 'Delete Post'}
        </button>
      </section>
    </div>
  )
}
