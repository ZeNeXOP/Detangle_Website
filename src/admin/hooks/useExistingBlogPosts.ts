import { useEffect, useState } from 'react'
import type { BlogPost } from '../../types'

export function useExistingBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)

  const refetch = () => {
    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BlogPost[]) => setPosts(data))
      .catch(() => setPosts([]))
  }

  useEffect(() => {
    refetch()
  }, [])

  return { posts, refetch }
}
