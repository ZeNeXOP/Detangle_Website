export async function uploadFile(file: File): Promise<{ url: string; resource_type: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/admin/uploads', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error ?? 'Upload failed.')
  }
  return response.json()
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
