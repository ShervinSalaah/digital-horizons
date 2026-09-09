import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- THIS LINE IS CRITICAL


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
