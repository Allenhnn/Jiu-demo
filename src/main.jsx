import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// 效能優化：移除未使用的 App.jsx / Copy.jsx import（避免打包進 bundle）
import MainFrame from './MainFrame.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainFrame />
  </StrictMode>,
)
