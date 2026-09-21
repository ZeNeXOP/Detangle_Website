import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BlogPost } from '../types'
import { formatEventDate } from '../lib/formatEventDate'

function BlogTile({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="blog-tile">
      <p className="blog-tile-title">{post.title}</p>
      {post.subtitle && <p className="blog-tile-subtitle">{post.subtitle}</p>}
      {post.published_at && <p className="blog-tile-date">{formatEventDate(post.published_at)}</p>}
      {post.short_description && <p className="blog-tile-excerpt">{post.short_description}</p>}
    </Link>
  )
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BlogPost[]) => {
        if (!cancelled) {
          setPosts(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPosts([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="section events-archive-section">
      <h1>Blog</h1>
      <p className="section-intro">Thoughts and articles from Noopur.</p>

      {posts && posts.length === 0 && <p className="events-empty-state">No posts yet — check back soon.</p>}

      {posts && posts.length > 0 && (
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogTile key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
