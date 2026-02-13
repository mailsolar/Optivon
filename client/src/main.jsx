import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <SettingsProvider>
        <ThemeProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </SettingsProvider>,
)

