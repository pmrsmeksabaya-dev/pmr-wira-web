import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient'
import { useDevice } from '../../hooks/useWindowWidth'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts'

export function AdminDashboard({ dark, s }) {
  const { isMobile, isTablet, isDesktop } = useDevice()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [adminData, setAdminData] = useState([])
  const [isOwner, setIsOwner] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [searchAdmin, setSearchAdmin] = useState('')
  const [exportMenu, setExportMenu] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [addAdminMsg, setAddAdminMsg] = useState('')
  const [addAdminLoading, setAddAdminLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  // Responsive sidebar
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
    else setSidebarOpen(true)
  }, [isMobile])

  const filteredAdminData = adminData.filter(item => 
    item.nama?.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchAdmin.toLowerCase())
  )

  const exportToPDF = () => {
    const printContent = document.getElementById('printable-table')
    if (!printContent) return
    const printWindow = window.open('', '_blank', 'width=1200,height=800')
    printWindow.document.write(`
      <html>
        <head><title>Data Anggota PMR</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #dc2626; text-align: center; margin-bottom: 5px; }
          p { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #dc2626; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 8px; font-size: 11px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; }
        </style>
        </head>
        <body>
          <h1>📋 LAPORAN DATA ANGGOTA PMR</h1>
          <p>PMR WIRA SMKN 1 PRINGGABAYA</p>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID')} | Total: ${filteredData.length} anggota</p>
          ${printContent.outerHTML}
          <div class="footer">Dicetak dari Sistem PMR WIRA | © 2026</div>
          <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const exportData = (type, mode) => {
    const fields = mode === 'lengkap' 
      ? ['nama_lengkap','nisn','kelas','jurusan','jenis_kelamin','tempat_lahir','tanggal_lahir','alamat','no_hp','email','golongan_darah','status','created_at']
      : ['nama_lengkap','nisn','kelas','jurusan','no_hp','status']
    
    const exp = filteredData.map(r => {
      const o = {}
      fields.forEach(f => o[f] = r[f] ?? '')
      return o
    })
    
    const csv = [fields.join(','), ...exp.map(r => fields.map(k => `"${(r[k]??'').toString().replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: type === 'excel' ? 'application/vnd.ms-excel' : 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `data-pmr-${mode}.${type === 'excel' ? 'xls' : 'csv'}`
    a.click()
    setExportMenu(false)
  }

  const loadData = async () => {
    setLoading(true)
    const { data: d } = await supabase.from('pendaftaran_pmr').select('*').order('created_at', { ascending: false })
    if (d) setData(d)
    setLoading(false)
  }

  const loadAdmins = async () => {
    const { data: d } = await supabase.from('app_admins').select('*')
    if (d) setAdminData(d)
  }

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/admin/login'); return }
    setCurrentAdmin(user)
    if (user.email === 'pmrsmeksabaya@gmail.com') setIsOwner(true)
  }

  useEffect(() => { checkAuth(); loadData(); loadAdmins() }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/admin/login') }
  const handleStatusChange = async (id, status) => { await supabase.from('pendaftaran_pmr').update({ status }).eq('id', id); loadData() }
  const handleDelete = async (id) => { if (window.confirm('Hapus data ini?')) { await supabase.from('pendaftaran_pmr').delete().eq('id', id); loadData() } }

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setAddAdminMsg('')
    setAddAdminLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setAddAdminMsg('❌ Sesi login expired. Silakan login ulang.')
        return
      }
      const response = await fetch(`https://kavcdotbteecdmgevxta.supabase.co/functions/v1/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword,
          created_by: currentAdmin?.email
        })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal menambah admin')
      setAddAdminMsg('✅ Admin berhasil ditambahkan!')
      setNewAdminEmail('')
      setNewAdminPassword('')
      loadAdmins()
      setTimeout(() => setAddAdminMsg(''), 3000)
    } catch (err) {
      setAddAdminMsg(`❌ Gagal: ${err.message}`)
    } finally {
      setAddAdminLoading(false)
    }
  }

  const filteredData = data.filter(item => {
    const match = item.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) || 
                  item.kelas?.includes(search) || 
                  item.jurusan?.toLowerCase().includes(search.toLowerCase())
    return filter === 'all' ? match : match && item.status === filter
  })

  // ============ STATISTIK LENGKAP ============
  const stats = {
    total: data.length,
    hariIni: data.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString()).length,
    laki: data.filter(d => d.jenis_kelamin === 'Laki-laki').length,
    perempuan: data.filter(d => d.jenis_kelamin === 'Perempuan').length,
    pending: data.filter(d => d.status === 'pending').length,
    diterima: data.filter(d => d.status === 'diterima').length,
    ditolak: data.filter(d => d.status === 'ditolak').length,
    mingguIni: data.filter(d => {
      const today = new Date()
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
      return new Date(d.created_at) >= startOfWeek
    }).length,
    bulanIni: data.filter(d => {
      const now = new Date()
      return new Date(d.created_at).getMonth() === now.getMonth()
    }).length
  }

  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const perBulan = Array(12).fill(0)
  data.forEach(d => { if (d.created_at) { const m = new Date(d.created_at).getMonth(); perBulan[m]++ } })
  const maxBulan = Math.max(...perBulan, 1)

  const goldar = { A: 0, B: 0, AB: 0, O: 0 }
  data.forEach(d => { if (d.golongan_darah && goldar[d.golongan_darah] !== undefined) goldar[d.golongan_darah]++ })
  const goldarData = Object.entries(goldar).map(([name, value]) => ({ name, value }))
  const goldarTerbanyak = goldarData.sort((a, b) => b.value - a.value)[0] || { name: '-', value: 0 }

  const jurusanCount = {}
  data.forEach(d => { if (d.jurusan) jurusanCount[d.jurusan] = (jurusanCount[d.jurusan] || 0) + 1 })
  const jurusanData = Object.entries(jurusanCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const kelasCount = {}
  data.forEach(d => { if (d.kelas) kelasCount[d.kelas] = (kelasCount[d.kelas] || 0) + 1 })
  const kelasData = Object.entries(kelasCount).map(([name, value]) => ({ name, value }))

  const COLORS = ['#dc2626', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#f97316']

  const gs = (st) => st === 'diterima' ? { bg: '#166534', c: '#86efac' } : st === 'ditolak' ? { bg: '#991b1b', c: '#fca5a5' } : { bg: '#854d0e', c: '#fde047' }

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    ...(isOwner ? [{ id: 'admin', icon: '👥', label: 'Data Admin' }] : []),
    { id: 'anggota', icon: '👤', label: 'Data Anggota' },
    { id: 'statistik', icon: '📈', label: 'Statistik' },
    { id: 'pengaturan', icon: '⚙️', label: 'Pengaturan' }
  ]

  if (loading) return <div style={{ minHeight: '100vh', background: s.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p style={{ color: s.text }}>Loading...</p></div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: s.bg }}>
      {/* SIDEBAR */}
      {(!isMobile || sidebarOpen) && (
        <div style={{ 
          width: isMobile ? '250px' : '250px', 
          background: s.card, 
          borderRight: s.cardBorder, 
          position: 'fixed', 
          top: isMobile ? '60px' : '65px',
          left: 0,
          height: isMobile ? 'calc(100vh - 60px)' : 'calc(100vh - 65px)',
          overflowY: 'auto',
          zIndex: 90,
          transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'none',
          transition: 'transform 0.3s ease'
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: s.text, fontSize: '20px', cursor: 'pointer' }}>✕</button>
          )}
          <div style={{ padding: '20px', textAlign: 'center', borderBottom: s.cardBorder }}>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '5px', border: '1.5px solid #dc2626', display: 'inline-block', marginBottom: '10px' }}>
              <img src="/pmr.jpg" alt="PMR" style={{ width: '45px', height: '45px' }} />
            </div>
            <p style={{ color: s.text, fontWeight: 'bold', fontSize: '0.85rem', margin: 0 }}>PMR WIRA</p>
            <p style={{ color: s.text3, fontSize: '0.7rem', margin: 0 }}>{currentAdmin?.email?.split('@')[0] || 'Admin'}</p>
            {isOwner && <p style={{ color: '#dc2626', fontSize: '0.65rem', marginTop: '5px' }}>⭐ OWNER</p>}
          </div>
          <nav style={{ padding: '15px 10px' }}>
            {menuItems.map(item => (
              <button key={item.id} onClick={() => { setActiveMenu(item.id); if(isMobile) setSidebarOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', background: activeMenu === item.id ? (dark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.1)') : 'transparent', color: activeMenu === item.id ? '#dc2626' : s.text2, marginBottom: '5px' }}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: '15px', borderTop: s.cardBorder }}>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px', border: '1px solid #ef4444', borderRadius: '8px', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}>🚪 Logout</button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: isMobile ? (sidebarOpen ? '250px' : '0') : '250px', flex: 1, width: isMobile ? (sidebarOpen ? 'calc(100% - 250px)' : '100%') : 'calc(100% - 250px)', overflowX: 'hidden', transition: 'margin-left 0.3s ease' }}>
        
        {/* Mobile menu toggle */}
        {isMobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, background: '#dc2626', color: '#fff', border: 'none', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            ☰
          </button>
        )}

        <header style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: isMobile ? '12px 16px' : '15px 20px', background: s.card, borderBottom: s.cardBorder, position: 'sticky', top: isMobile ? '60px' : '65px', zIndex: 100 }}>
          <div style={{ flex: 1 }}></div>
          <button onClick={() => { loadData(); loadAdmins() }} style={{ background: 'transparent', border: '1px solid ' + s.inputBorder, color: s.text2, padding: isMobile ? '6px 10px' : '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: isMobile ? '0.7rem' : '0.8rem' }}>🔄 Refresh</button>
        </header>

        <div style={{ padding: isMobile ? '16px' : '20px' }}>
          
          {/* ============ DASHBOARD ============ */}
          {activeMenu === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '15px' }}>
                <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '5px' }}>👥</div>
                  <h2 style={{ fontSize: '1.8rem', margin: '5px 0', color: '#3b82f6' }}>{stats.total}</h2>
                  <p style={{ color: s.text3, margin: 0 }}>Total Anggota</p>
                </div>
                <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📅</div>
                  <h2 style={{ fontSize: '1.8rem', margin: '5px 0', color: '#22c55e' }}>{stats.hariIni}</h2>
                  <p style={{ color: s.text3, margin: 0 }}>Pendaftar Hari Ini</p>
                </div>
                <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '5px' }}>♂️♀️</div>
                  <h2 style={{ fontSize: '1.8rem', margin: '5px 0', color: '#a855f7' }}>{stats.laki}/{stats.perempuan}</h2>
                  <p style={{ color: s.text3, margin: 0 }}>Rasio Gender</p>
                </div>
                <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🩸</div>
                  <h2 style={{ fontSize: '1.8rem', margin: '5px 0', color: '#eab308' }}>{goldarTerbanyak.name} ({goldarTerbanyak.value})</h2>
                  <p style={{ color: s.text3, margin: 0 }}>Goldar Terbanyak</p>
                </div>
              </div>

              {/* Chart Pendaftaran Per Bulan */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>📊 Pendaftaran Per Bulan</h3>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? '4px' : '8px', height: '200px', minWidth: isMobile ? '500px' : 'auto' }}>
                    {perBulan.map((v, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ color: s.text3, fontSize: '0.6rem', marginBottom: '4px' }}>{v > 0 ? v : ''}</span>
                        <div style={{ width: '100%', height: `${(v / maxBulan) * 100}%`, background: 'linear-gradient(180deg, #dc2626, #991b1b)', borderRadius: '4px 4px 0 0', minHeight: v > 0 ? '4px' : '0' }}></div>
                        <span style={{ color: s.text3, fontSize: isMobile ? '0.55rem' : '0.65rem', marginTop: '6px' }}>{bulan[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '15px' }}>
                <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#eab308', borderRadius: '50%', marginRight: '8px' }}></span>
                  <strong>Pending</strong>
                  <p style={{ fontSize: '1.5rem', color: '#eab308' }}>{stats.pending}</p>
                </div>
                <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', marginRight: '8px' }}></span>
                  <strong>Diterima</strong>
                  <p style={{ fontSize: '1.5rem', color: '#22c55e' }}>{stats.diterima}</p>
                </div>
                <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', marginRight: '8px' }}></span>
                  <strong>Ditolak</strong>
                  <p style={{ fontSize: '1.5rem', color: '#ef4444' }}>{stats.ditolak}</p>
                </div>
              </div>
            </div>
          )}

          {/* ============ DATA ADMIN ============ */}
          {activeMenu === 'admin' && isOwner && (
            <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: isMobile ? '15px' : '20px' }}>
              <div style={{ background: s.inputBg, border: s.cardBorder, borderRadius: '12px', padding: isMobile ? '15px' : '20px', marginBottom: '25px' }}>
                <h4 style={{ color: s.text, marginBottom: '15px' }}>➕ Tambah Admin Baru</h4>
                <form onSubmit={handleAddAdmin}>
                  <input type="email" required placeholder="Email admin baru" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '10px 12px', borderRadius: '8px', width: '100%', marginBottom: '10px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  <input type="password" required placeholder="Password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '10px 12px', borderRadius: '8px', width: '100%', marginBottom: '12px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                  <button type="submit" disabled={addAdminLoading} style={{ width: '100%', padding: '10px', fontSize: '0.9rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: addAdminLoading ? 0.7 : 1 }}>{addAdminLoading ? 'Menambahkan...' : 'Tambah Admin'}</button>
                </form>
                {addAdminMsg && <p style={{ color: addAdminMsg.includes('✅') ? '#22c55e' : '#ef4444', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>{addAdminMsg}</p>}
              </div>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '20px', gap: '10px' }}>
                <h3 style={{ color: s.text, margin: 0 }}>👥 Daftar Admin</h3>
                <input type="text" placeholder="🔍 Cari nama atau email..." value={searchAdmin} onChange={e => setSearchAdmin(e.target.value)} style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '8px 12px', borderRadius: '8px', width: isMobile ? '100%' : '250px', fontSize: '0.8rem', boxSizing: 'border-box' }} />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '400px' : 'auto' }}>
                  <thead><tr><th style={{ background: s.thBg, color: s.thColor, padding: '10px', textAlign: 'left' }}>No</th><th style={{ background: s.thBg, color: s.thColor, padding: '10px', textAlign: 'left' }}>Nama</th><th style={{ background: s.thBg, color: s.thColor, padding: '10px', textAlign: 'left' }}>Email</th><th style={{ background: s.thBg, color: s.thColor, padding: '10px', textAlign: 'left' }}>Dibuat</th></tr></thead>
                  <tbody>
                    {filteredAdminData.length === 0 ? (<tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: s.text3 }}>Belum ada data admin</td></tr>) : (
                      filteredAdminData.map((a, i) => (<tr key={a.id} style={{ borderBottom: '1px solid ' + (dark ? 'rgba(220,38,38,0.1)' : '#eee') }}><td style={{ padding: '10px' }}>{i+1}</td><td style={{ padding: '10px', color: s.text }}>{a.nama}</td><td style={{ padding: '10px', color: s.text2 }}>{a.email}</td><td style={{ padding: '10px', color: s.text3, fontSize: '0.75rem' }}>{new Date(a.created_at).toLocaleDateString('id-ID')}</td></tr>))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ DATA ANGGOTA ============ */}
          {activeMenu === 'anggota' && (
            <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: isMobile ? '12px 15px' : '15px 20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '10px', borderBottom: s.cardBorder }}>
                <h3 style={{ color: s.text, fontSize: '0.95rem', margin: 0 }}>👤 Data Anggota ({filteredData.length})</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="🔍 Cari..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', width: isMobile ? '100%' : '180px', boxSizing: 'border-box' }} />
                  <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <option value="all">Semua Status</option><option value="pending">⏳ Pending</option><option value="diterima">✅ Diterima</option><option value="ditolak">❌ Ditolak</option>
                  </select>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setExportMenu(!exportMenu)} style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>📥 Export</button>
                    {exportMenu && (
                      <div style={{ position: 'absolute', top: '40px', right: 0, background: s.card, border: s.cardBorder, borderRadius: '10px', padding: '10px', zIndex: 200, minWidth: '150px' }}>
                        <button onClick={() => exportData('csv', 'lengkap')} style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', color: s.text, padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem' }}>📄 CSV Lengkap</button>
                        <button onClick={() => exportData('csv', 'detail')} style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', color: s.text, padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem' }}>📄 CSV Detail</button>
                        <button onClick={() => exportData('excel', 'lengkap')} style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', color: s.text, padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem' }}>📊 Excel Lengkap</button>
                        <button onClick={() => exportData('excel', 'detail')} style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', color: s.text, padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem' }}>📊 Excel Detail</button>
                        <button onClick={exportToPDF} style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', color: '#dc2626', padding: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.75rem', borderTop: '1px solid ' + s.inputBorder, marginTop: '5px' }}>📑 PDF Print</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table id="printable-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '800px' : '1000px' }}>
                  <thead><tr>{['No','Nama','NISN','Kelas','Jurusan','JK','Goldar','No HP','Status','Aksi'].map(h => (<th key={h} style={{ background: s.thBg, color: s.thColor, padding: '10px', textAlign: 'left', fontSize: '0.75rem' }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {filteredData.length === 0 ? (<tr><td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: s.text3 }}>Belum ada data</td></tr>) : (
                      filteredData.map((item, i) => {
                        const st = gs(item.status)
                        return (<tr key={item.id} style={{ borderBottom: '1px solid ' + (dark ? 'rgba(220,38,38,0.1)' : '#eee') }}>
                          <td style={{ padding: '10px' }}>{i+1}</td>
                          <td style={{ padding: '10px', color: s.text, fontWeight: '500' }}>{item.nama_lengkap}</td>
                          <td style={{ padding: '10px', color: s.text2 }}>{item.nisn}</td>
                          <td style={{ padding: '10px', color: s.text2 }}>{item.kelas}</td>
                          <td style={{ padding: '10px', color: s.text2 }}>{item.jurusan}</td>
                          <td style={{ padding: '10px', color: s.text2 }}>{item.jenis_kelamin}</td>
                          <td style={{ padding: '10px', color: s.text2 }}>{item.golongan_darah || '-'}</td>
                          <td style={{ padding: '10px', color: s.text2 }}>{item.no_hp}</td>
                          <td style={{ padding: '10px' }}><span style={{ background: st.bg, color: st.c, padding: '4px 10px', borderRadius: '15px', fontSize: '0.7rem' }}>{item.status}</span></td>
                          <td style={{ padding: '10px' }}>
                            <select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value)} style={{ width: '90px', fontSize: '0.7rem', padding: '5px', background: s.inputBg, border: s.inputBorder, color: s.inputColor, borderRadius: '4px', marginRight: '5px' }}>
                              <option value="pending">Pending</option><option value="diterima">Diterima</option><option value="ditolak">Ditolak</option>
                            </select>
                            <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>🗑️</button>
                          </td>
                        </tr>)
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ STATISTIK LENGKAP ============ */}
          {activeMenu === 'statistik' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {/* Ringkasan */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>📊 Ringkasan Data</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '15px' }}>
                  <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(220,38,38,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '2rem' }}>👥</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.total}</div>
                    <div style={{ fontSize: '0.7rem', color: s.text3 }}>Total Pendaftar</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(220,38,38,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '2rem' }}>📅</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.mingguIni}</div>
                    <div style={{ fontSize: '0.7rem', color: s.text3 }}>Minggu Ini</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(220,38,38,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '2rem' }}>📆</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.bulanIni}</div>
                    <div style={{ fontSize: '0.7rem', color: s.text3 }}>Bulan Ini</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(220,38,38,0.05)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '2rem' }}>✅</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.diterima}</div>
                    <div style={{ fontSize: '0.7rem', color: s.text3 }}>Diterima</div>
                  </div>
                </div>
              </div>

              {/* Chart Pendaftaran */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>📈 Pendaftaran Per Bulan</h3>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ height: 300, minWidth: isMobile ? '500px' : 'auto' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={perBulan.map((v, i) => ({ bulan: bulan[i], jumlah: v }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#444' : '#ccc'} />
                        <XAxis dataKey="bulan" stroke={s.text3} />
                        <YAxis stroke={s.text3} />
                        <Tooltip contentStyle={{ background: s.card, border: s.cardBorder, color: s.text }} />
                        <Legend />
                        <Bar dataKey="jumlah" fill="#dc2626" name="Jumlah Pendaftar" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Chart Golongan Darah */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>🩸 Distribusi Golongan Darah</h3>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                  <div style={{ width: isMobile ? '200px' : '250px', height: isMobile ? '200px' : '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={goldarData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {goldarData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    {goldarData.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: COLORS[i % COLORS.length], borderRadius: '2px' }}></div>
                        <span style={{ color: s.text }}>{item.name}:</span>
                        <span style={{ color: s.text2 }}>{item.value} orang ({stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(1) : 0}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Jurusan Terpopuler */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>🏫 Jurusan Terpopuler</h3>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ height: 300, minWidth: isMobile ? '400px' : 'auto' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={jurusanData.slice(0, 6)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#444' : '#ccc'} />
                        <XAxis type="number" stroke={s.text3} />
                        <YAxis type="category" dataKey="name" width={100} stroke={s.text3} />
                        <Tooltip contentStyle={{ background: s.card, border: s.cardBorder, color: s.text }} />
                        <Bar dataKey="value" fill="#3b82f6" name="Jumlah Pendaftar" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Chart Kelas */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>📚 Distribusi Kelas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '15px' }}>
                  {kelasData.map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '15px', background: 'rgba(220,38,38,0.05)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>{item.value}</div>
                      <div style={{ fontSize: '0.8rem', color: s.text3 }}>Kelas {item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ PENGATURAN ============ */}
          {activeMenu === 'pengaturan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {/* Profil Sekolah */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>🏫 Profil Sekolah</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div><label style={{ color: s.text2, display: 'block', marginBottom: '5px' }}>Nama Sekolah</label><input type="text" defaultValue="SMKN 1 Pringgabaya" style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '10px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ color: s.text2, display: 'block', marginBottom: '5px' }}>Alamat</label><input type="text" defaultValue="Jl. Pendidikan No. 1, Pringgabaya, Lombok Timur" style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '10px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ color: s.text2, display: 'block', marginBottom: '5px' }}>Telepon</label><input type="text" defaultValue="(0376) 123456" style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '10px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ color: s.text2, display: 'block', marginBottom: '5px' }}>Email</label><input type="email" defaultValue="info@smkn1pringgabaya.sch.id" style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '10px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }} /></div>
                  <div><label style={{ color: s.text2, display: 'block', marginBottom: '5px' }}>Website</label><input type="text" defaultValue="www.smkn1pringgabaya.sch.id" style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '10px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }} /></div>
                  <button style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>💾 Simpan Perubahan</button>
                </div>
              </div>

              {/* Pengaturan Aplikasi */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>⚙️ Pengaturan Aplikasi</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ color: s.text }}>🌙 Mode Gelap/Terang</span>
                    <span style={{ color: s.text2 }}>{dark ? 'Gelap' : 'Terang'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ color: s.text }}>🔔 Notifikasi Email</span>
                    <label><input type="checkbox" defaultChecked style={{ accentColor: '#dc2626' }} /> Aktif</label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ color: s.text }}>📊 Auto Refresh Dashboard</span>
                    <select style={{ background: s.inputBg, border: s.inputBorder, color: s.inputColor, padding: '8px', borderRadius: '6px' }}><option>30 detik</option><option>1 menit</option><option>5 menit</option><option>Nonaktif</option></select>
                  </div>
                </div>
              </div>

              {/* Backup & Restore */}
              <div style={{ background: s.card, border: s.cardBorder, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: s.text, marginBottom: '15px' }}>💾 Backup & Restore</h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>📥 Backup Database</button>
                  <button style={{ background: '#eab308', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>🔄 Restore Database</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}