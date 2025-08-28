import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CarruselProvider } from './context/CarruselContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CarruselProvider>
        <App />
      </CarruselProvider>
    </BrowserRouter>
  </StrictMode>,
)
