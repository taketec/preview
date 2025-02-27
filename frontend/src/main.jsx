import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GLBViewer from './GLBViewer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GLBViewer />
  </StrictMode>,
)
