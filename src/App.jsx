import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/common/Navbar'
import { Home } from './pages/Home/Home'
import { Pendaftaran } from './pages/Pendaftaran/Pendaftaran'
import { AdminLogin } from './pages/AdminLogin/AdminLogin'
import { AdminDashboard } from './pages/AdminDashboard/AdminDashboard'
import { darkTheme, lightTheme } from './styles/theme'

function useTheme() {
  const [dark, setDark] = useState(true)
  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }
  return { dark, toggle }
}

function App() {
  const { dark, toggle } = useTheme()
  const s = dark ? darkTheme : lightTheme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <BrowserRouter>
      <Navbar dark={dark} toggle={toggle} s={s} />
      <Routes>
        <Route path="/" element={<Home dark={dark} s={s} />} />
        <Route path="/pendaftaran" element={<Pendaftaran dark={dark} s={s} />} />
        <Route path="/admin/login" element={<AdminLogin dark={dark} s={s} />} />
        <Route path="/admin/dashboard" element={<AdminDashboard dark={dark} s={s} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App