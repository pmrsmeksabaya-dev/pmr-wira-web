import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useWindowWidth } from '../../hooks/useWindowWidth'

export function Navbar({ dark, toggle, s }) {
  const width = useWindowWidth()
  const isMobile = width <= 768
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ 
      position: 'fixed', 
      top: 0, 
      width: '100%', 
      zIndex: 1000, 
      backdropFilter: 'blur(10px)', 
      background: s.navbarBg, 
      borderBottom: s.navbarBorder,
      height: isMobile ? '60px' : '65px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '0 16px' : '0 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: '#fff', borderRadius: '6px', padding: '3px', border: '1.5px solid #dc2626' }}>
            <img src="/pmr.jpg" alt="PMR" style={{ width: isMobile ? '35px' : '38px', height: isMobile ? '35px' : '38px' }} />
          </div>
          <div>
            <div style={{ color: s.text, fontWeight: 'bold', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>PMR WIRA</div>
            <div style={{ color: s.text3, fontSize: isMobile ? '0.6rem' : '0.7rem' }}>SMKN 1 Pringgabaya</div>
          </div>
        </Link>

        {!isMobile && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/" style={{ color: s.text2, textDecoration: 'none', fontSize: '0.9rem' }}>Beranda</Link>
            <Link to="/pendaftaran" style={{ color: s.text2, textDecoration: 'none', fontSize: '0.9rem' }}>Pendaftaran</Link>
            <Link to="/admin/login">
              <button style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Login Admin
              </button>
            </Link>
            <button 
              onClick={toggle} 
              style={{ 
                background: 'transparent', 
                border: '1px solid ' + (dark ? '#fbbf24' : '#6b7280'), 
                borderRadius: '50%', 
                width: '36px', 
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                color: dark ? '#fbbf24' : '#6b7280' 
              }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        )}

        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={toggle} 
              style={{ 
                background: 'transparent', 
                border: '1px solid ' + (dark ? '#fbbf24' : '#6b7280'), 
                borderRadius: '50%', 
                width: '34px', 
                height: '34px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                color: dark ? '#fbbf24' : '#6b7280' 
              }}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              style={{ background: 'transparent', border: 'none', color: s.text, cursor: 'pointer', fontSize: '24px', display: 'flex', alignItems: 'center' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}
      </div>

      {isMobile && menuOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '60px', 
          left: 0, 
          right: 0, 
          background: s.card, 
          borderBottom: s.cardBorder, 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          zIndex: 999
        }}>
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ color: s.text2, textDecoration: 'none', padding: '8px 0' }}>Beranda</Link>
          <Link to="/pendaftaran" onClick={() => setMenuOpen(false)} style={{ color: s.text2, textDecoration: 'none', padding: '8px 0' }}>Pendaftaran</Link>
          <Link to="/admin/login" onClick={() => setMenuOpen(false)}>
            <button style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '10px', borderRadius: '8px', width: '100%', cursor: 'pointer' }}>
              Login Admin
            </button>
          </Link>
        </div>
      )}
    </nav>
  )
}