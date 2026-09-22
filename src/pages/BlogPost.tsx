import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { BlogPost as BlogPostType } from '../types'
import { formatEventDate } from '../lib/formatEventDate'
import { renderRichText } from '../lib/richText'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  // undefined = loading, null = not found
  const [post, setPost] = useState<BlogPostType | null | undefined>(undefined)

  useEffect(() => {
    if (!slug) {
      return
    }

    let cancelled = false

    fetch(`/api/blog/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BlogPostType | null) => {
        if (!cancelled) {
          setPost(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPost(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (post === undefined) {
    return (
      <section className="section event-detail-section">
        <p>Loading…</p>
      </section>
    )
  }

  if (post === null) {
    return (
      <section className="section event-detail-section">
        <p>Post not found.</p>
        <Link to="/blog" className="event-detail-back">
          ← Back to Blog
        </Link>
      </section>
    )
  }

  return (
    <section className="section event-detail-section">
      <Link to="/blog" className="event-detail-back">
        ← Back to Blog
      </Link>

      {post.published_at && <p className="eyebrow">{formatEventDate(post.published_at)}</p>}
      <h1>{post.title}</h1>
      {post.subtitle && <p className="lead">{post.subtitle}</p>}

      <div className="blog-post-content">{renderRichText(post.content)}</div>
    </section>
  )
}
