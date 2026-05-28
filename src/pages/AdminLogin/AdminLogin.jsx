import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useDevice } from '../../hooks/useWindowWidth'

export function AdminLogin({ dark, s }) {
  const { isMobile, isTablet, isDesktop } = useDevice()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logStats, setLogStats] = useState({ total: 0, lastLogin: null, uniqueUsers: 0 })
  const navigate = useNavigate()

  // Responsive values
  const containerMaxWidth = isMobile ? '100%' : isTablet ? '90%' : '480px'
  const pagePadding = isMobile ? '80px 16px 40px' : isTablet ? '90px 24px 40px' : '100px 20px 40px'
  const logoSize = isMobile ? '50px' : isTablet ? '60px' : '70px'
  const titleFontSize = isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.6rem'
  const formPadding = isMobile ? '20px' : isTablet ? '22px' : '25px'
  const inputPadding = isMobile ? '10px 12px' : isTablet ? '11px 13px' : '12px 14px'
  const inputFontSize = isMobile ? '0.85rem' : isTablet ? '0.88rem' : '0.9rem'
  const statsGridCols = isMobile ? '1fr' : 'repeat(3, 1fr)'
  const headerFlexDir = isMobile ? 'column' : 'row'
  const headerAlign = isMobile ? 'flex-start' : 'center'
  const tableFontSize = isMobile ? '0.65rem' : isTablet ? '0.7rem' : '0.75rem'
  const smallFontSize = isMobile ? '0.65rem' : isTablet ? '0.68rem' : '0.7rem'
  const buttonSize = isMobile ? '0.7rem' : isTablet ? '0.72rem' : '0.75rem'

  const getDeviceInfo = () => {
  const ua = navigator.userAgent
  console.log('User Agent:', ua)  // Buat debug, bisa dihapus nanti
  
  // Deteksi MOBILE dulu (prioritas)
  if (ua.includes('Android')) return '📱 Android Phone'
  if (ua.includes('iPhone')) return '📱 iPhone'
  if (ua.includes('iPad')) return '📱 iPad'
  
  // Deteksi OS Desktop
  if (ua.includes('Windows')) return '💻 Windows PC'
  if (ua.includes('Mac')) return '🍎 MacBook'
  if (ua.includes('Linux')) return '🐧 Linux PC'
  
  return '❓ Unknown Device'
}
  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('login_logs')
        .select('*')
        .order('waktu_login', { ascending: false })
        .limit(20)
      if (!error && data) setLogs(data)
    } catch (err) {}
  }

  useEffect(() => {
    loadLogs()
    const channel = supabase
      .channel('login_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'login_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 20))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (logs.length > 0) {
      const uniqueEmails = [...new Set(logs.map(l => l.email))].length
      setLogStats({
        total: logs.length,
        lastLogin: logs[0]?.waktu_login,
        uniqueUsers: uniqueEmails
      })
    } else {
      setLogStats({ total: 0, lastLogin: null, uniqueUsers: 0 })
    }
  }, [logs])

  useEffect(() => {
    setEmail('')
    setPassword('')
    setRemember(false)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error: le } = await supabase.auth.signInWithPassword({ email, password })
      if (le) throw le
      if (data?.user) {
        await supabase.from('login_logs').insert([{ 
          user_id: data.user.id, 
          email, 
          nama_perangkat: getDeviceInfo(), 
          ip_address: 'local', 
          user_agent: navigator.userAgent.substring(0, 200) 
        }])
        
        if (remember) {
          localStorage.setItem('remember_me', 'true')
          localStorage.setItem('remembered_email', email)
          localStorage.setItem('remembered_password', password)
        } else {
          localStorage.removeItem('remember_me')
          localStorage.removeItem('remembered_email')
          localStorage.removeItem('remembered_password')
        }
        navigate('/admin/dashboard')
      }
    } catch (err) { 
      setError('Login gagal! Periksa email dan password.') 
    } finally { 
      setLoading(false) 
    }
  }

  const refreshLogs = () => loadLogs()
  
  const deleteLogs = async () => {
    if (!window.confirm('Hapus semua logs?')) return
    const { error } = await supabase.from('login_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (!error) { setLogs([]); alert('✅ Semua logs dihapus!'); loadLogs() }
    else { alert('❌ Gagal menghapus logs!') }
  }

  const downloadCSV = () => {
    if (!logs.length) return alert('Tidak ada data')
    const headers = ['Email', 'Perangkat', 'Waktu Login', 'IP Address']
    const rows = logs.map(l => [l.email, l.nama_perangkat, new Date(l.waktu_login).toLocaleString('id-ID'), l.ip_address || '-'])
    let csv = headers.join(',') + '\n'
    rows.forEach(row => { csv += row.map(c => `"${c}"`).join(',') + '\n' })
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `login-logs-${new Date().toISOString().slice(0,19)}.csv`
    a.click()
  }

  const downloadExcel = () => {
    if (!logs.length) return alert('Tidak ada data')
    let rows = ''
    logs.forEach(l => {
      rows += `<tr><td>${l.email}</td><td>${l.nama_perangkat}</td><td>${new Date(l.waktu_login).toLocaleString('id-ID')}</td><td>${l.ip_address || '-'}</td></tr>`
    })
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Login Logs</title><style>th{background:#dc2626;color:#fff;padding:8px}td{border:1px solid #ddd;padding:6px}table{border-collapse:collapse;width:100%}</style></head><body><h2>📋 LAPORAN AKTIVITAS LOGIN</h2><p>PMR WIRA | Total: ${logs.length} | User Unik: ${logStats.uniqueUsers}</p><table><thead><tr><th>Email</th><th>Perangkat</th><th>Waktu Login</th><th>IP Address</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `login-logs-${new Date().toISOString().slice(0,19)}.xls`
    a.click()
  }

  return (
    <div style={{ minHeight: '100vh', padding: pagePadding, background: s.bg }}>
      <div style={{ maxWidth: containerMaxWidth, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '30px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: isMobile ? '8px' : '10px', border: '2px solid #dc2626', display: 'inline-block', marginBottom: isMobile ? '10px' : '15px' }}>
            <img src="/pmr.jpg" alt="PMR" style={{ width: logoSize, height: logoSize }} />
          </div>
          <h1 style={{ color: s.text, textShadow: s.glow, fontSize: titleFontSize, marginBottom: '5px' }}>Login Admin</h1>
          <p style={{ color: s.text2, fontSize: isMobile ? '0.75rem' : '0.85rem' }}>PMR Wira SMKN 1 Pringgabaya</p>
        </div>

        <div style={{ background: s.card, border: s.cardBorder, padding: formPadding, borderRadius: '16px', marginBottom: '15px' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: s.text2, display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="off" style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: inputPadding, borderRadius: '8px', width: '100%', fontSize: inputFontSize, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ color: s.text2, display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
  <input 
    type={showPassword ? 'text' : 'password'} 
    required 
    value={password} 
    onChange={e => setPassword(e.target.value)} 
    placeholder="••••••••" 
    autoComplete="off"
    style={{ 
      background: s.inputBg, 
      border: s.inputBorder, 
      color: s.inputColor, 
      padding: inputPadding, 
      borderRadius: '8px', 
      width: '100%', 
      fontSize: inputFontSize, 
      boxSizing: 'border-box',
      paddingRight: '40px'
    }} 
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: s.text3,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {showPassword ? '🙈' : '👁️'}
  </button>
</div>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#dc2626', cursor: 'pointer' }} />
              <label htmlFor="remember" style={{ color: s.text2, fontSize: '0.8rem', cursor: 'pointer' }}>Ingat Saya</label>
            </div>
            {error && <div style={{ background: '#991b1b', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: isMobile ? '12px' : '13px', fontSize: isMobile ? '0.9rem' : '1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Loading...' : 'Login 🔐'}
            </button>
          </form>
        </div>

        <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: isMobile ? '12px' : '15px' }}>
          <div style={{ display: 'flex', flexDirection: headerFlexDir, justifyContent: 'space-between', alignItems: headerAlign, marginBottom: '15px', gap: isMobile ? '10px' : '0' }}>
            <h4 style={{ color: s.text, fontSize: isMobile ? '0.85rem' : '0.9rem', margin: 0 }}>🕐 Aktivitas Login Terkini</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button onClick={refreshLogs} style={{ background: 'transparent', border: '1px solid ' + s.inputBorder, color: s.text2, padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: buttonSize }}>🔄</button>
              <button onClick={downloadExcel} style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: buttonSize }}>📊</button>
              <button onClick={downloadCSV} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: buttonSize }}>📥</button>
              <button onClick={deleteLogs} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: buttonSize }}>🗑️</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: statsGridCols, gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(220,38,38,0.1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: smallFontSize, color: s.text3 }}>TOTAL LOGIN</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#dc2626' }}>{logStats.total}</div>
            </div>
            <div style={{ background: 'rgba(220,38,38,0.1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: smallFontSize, color: s.text3 }}>USER UNIK</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#dc2626' }}>{logStats.uniqueUsers}</div>
            </div>
            <div style={{ background: 'rgba(220,38,38,0.1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: smallFontSize, color: s.text3 }}>TERAKHIR LOGIN</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: s.text }}>{logStats.lastLogin ? new Date(logStats.lastLogin).toLocaleDateString('id-ID') : '-'}</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: isMobile ? '300px' : 'auto', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid #dc2626' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: s.text2, fontSize: tableFontSize, fontWeight: '600' }}>User</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: s.text2, fontSize: tableFontSize, fontWeight: '600' }}>Perangkat</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: s.text2, fontSize: tableFontSize, fontWeight: '600' }}>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: s.text3, fontSize: '0.8rem' }}>Belum ada aktivitas login</td></tr>
                ) : (
                  logs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid ' + (dark ? 'rgba(255,255,255,0.08)' : '#eee') }}>
                      <td style={{ padding: '10px 8px', color: s.text, fontSize: tableFontSize, fontWeight: '500' }}>{log.email?.split('@')[0]}</td>
                      <td style={{ padding: '10px 8px', color: s.text3, fontSize: smallFontSize }}>{log.nama_perangkat}</td>
                      <td style={{ padding: '10px 8px', color: s.text3, fontSize: smallFontSize }}>{new Date(log.waktu_login).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}