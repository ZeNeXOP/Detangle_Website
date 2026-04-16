import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRefactored from './AppRefactored'

const faviconElement = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
const logoImage = 'public/assets/IMG_3208.PNG'

if (faviconElement) {
  faviconElement.href = logoImage
} else {
  const newFaviconElement = document.createElement('link')
  newFaviconElement.rel = 'icon'
  newFaviconElement.href = logoImage
  document.head.appendChild(newFaviconElement)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRefactored />
  </StrictMode>,
)
