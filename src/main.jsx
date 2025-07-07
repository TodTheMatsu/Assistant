import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FlowChartProvider } from './FlowChartContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlowChartProvider>
      <App />
    </FlowChartProvider>
  </StrictMode>,
)
