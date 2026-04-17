import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRefactored from './AppRefactored'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRefactored />
  </StrictMode>,
)
