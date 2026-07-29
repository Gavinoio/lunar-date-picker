import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../../../packages/styles/src/index.css'
import '../../shared/demo.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
