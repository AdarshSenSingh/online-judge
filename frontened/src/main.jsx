import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {Toaster} from "react-hot-toast"
import { AuthProvider } from './token/auth.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
   <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>
  </AuthProvider>
 
)