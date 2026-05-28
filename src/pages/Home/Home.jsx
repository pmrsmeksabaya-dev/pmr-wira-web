import { Link } from 'react-router-dom'
import { useWindowWidth } from '../../hooks/useWindowWidth'

export function Home({ dark, s }) {
  const width = useWindowWidth()
  const isMobile = width <= 640
  const isTablet = width > 640 && width <= 1024

  return (
    <div style={{ paddingTop: isMobile ? '70px' : '80px', background: s.bg, minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : isTablet ? '40px 20px' : '60px 20px' }}>
        
        {/* LOGOS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '15px' : '30px', marginBottom: isMobile ? '20px' : '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', borderRadius: isMobile ? '10px' : '12px', padding: isMobile ? '6px' : '8px', border: '2px solid #dc2626' }}>
            <img src="/pmr.jpg" alt="PMR" style={{ width: isMobile ? '60px' : '100px', height: isMobile ? '60px' : '100px' }} />
          </div>
          <div style={{ background: '#fff', borderRadius: isMobile ? '10px' : '12px', padding: isMobile ? '6px' : '8px', border: '2px solid #dc2626' }}>
            <img src="/pmi.jpg" alt="PMI" style={{ width: isMobile ? '60px' : '100px', height: isMobile ? '60px' : '100px' }} />
          </div>
        </div>

        {/* TITLE */}
        <h1 style={{ fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '3rem', color: s.text, textShadow: s.glow, lineHeight: '1.3' }}>
          PALANG MERAH REMAJA <span style={{ display: 'inline-block' }}>WIRA</span>
        </h1>
        
        <p style={{ fontSize: isMobile ? '1rem' : isTablet ? '1.2rem' : '1.5rem', color: s.text2, marginTop: '8px' }}>
          UNIT SMKN 1 PRINGGABAYA
        </p>
        
        <p style={{ fontSize: isMobile ? '0.9rem' : '1.2rem', color: '#dc2626', marginBottom: '30px', padding: '0 10px' }}>
          Bersama Kita Wujudkan Generasi Muda Peduli Kemanusiaan
        </p>

        {/* BUTTONS */}
        <div style={{ display: 'flex', gap: isMobile ? '12px' : '15px', justifyContent: 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
          <Link to="/pendaftaran" style={{ width: isMobile ? '100%' : 'auto' }}>
            <button style={{ background: '#dc2626', color: '#fff', border: 'none', padding: isMobile ? '12px 24px' : '12px 24px', borderRadius: '8px', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 'bold' }}>
              Daftar Sekarang 🔥
            </button>
          </Link>
          <Link to="/admin/login" style={{ width: isMobile ? '100%' : 'auto' }}>
            <button style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: isMobile ? '12px 24px' : '12px 24px', borderRadius: '8px', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontSize: isMobile ? '0.9rem' : '1rem' }}>
              Login Admin
            </button>
          </Link>
        </div>

        {/* STATISTICS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '12px' : '20px', maxWidth: '800px', margin: '50px auto 0' }}>
          {[{ v: '14', l: 'Jurusan Tersedia' }, { v: '500+', l: 'Siswa Aktif' }, { v: '50+', l: 'Guru Profesional' }].map((st, i) => (
            <div key={i} style={{ background: s.card, border: s.cardBorder, borderRadius: '16px', padding: isMobile ? '20px' : '24px', textAlign: 'center' }}>
              <h2 style={{ fontSize: isMobile ? '1.8rem' : '2rem', color: s.text, margin: 0 }}>{st.v}</h2>
              <p style={{ color: s.text2, margin: '8px 0 0', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>{st.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div style={{ padding: isMobile ? '40px 16px' : '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: isMobile ? '1.5rem' : isTablet ? '1.8rem' : '2rem', color: s.text, textShadow: s.glow }}>Tentang PMR</h2>
        <p style={{ color: s.text2, maxWidth: '700px', margin: '0 auto 40px', fontSize: isMobile ? '0.9rem' : '1rem', padding: '0 16px' }}>
          Palang Merah Remaja (PMR) adalah wadah pembinaan dan pengembangan anggota remaja PMI.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { t: 'Pertolongan Pertama', d: 'Mempelajari teknik pertolongan pertama.' },
            { t: 'Kepemimpinan', d: 'Mengembangkan jiwa kepemimpinan.' },
            { t: 'Kemanusiaan', d: 'Menumbuhkan rasa kemanusiaan.' }
          ].map((item, i) => (
            <div key={i} style={{ background: s.card, border: s.cardBorder, padding: isMobile ? '20px' : '30px', borderRadius: '16px' }}>
              <h3 style={{ color: s.text, marginBottom: '10px', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{item.t}</h3>
              <p style={{ color: s.text2, fontSize: isMobile ? '0.85rem' : '0.9rem' }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: s.footerBorder, padding: isMobile ? '20px 16px' : '30px', textAlign: 'center', marginTop: '40px', background: s.footerBg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', borderRadius: '6px', padding: '2px', border: '1.5px solid #dc2626' }}>
            <img src="/pmr.jpg" alt="PMR" style={{ width: '30px', height: '30px' }} />
          </div>
          <span style={{ color: s.text, fontWeight: 'bold', textShadow: s.glow, fontSize: isMobile ? '0.85rem' : '1rem' }}>PMR WIRA</span>
          <div style={{ background: '#fff', borderRadius: '6px', padding: '2px', border: '1.5px solid #dc2626' }}>
            <img src="/pmi.jpg" alt="PMI" style={{ width: '30px', height: '30px' }} />
          </div>
        </div>
        <p style={{ color: s.text3, fontSize: isMobile ? '0.7rem' : '0.9rem' }}>
          © 2026 Palang Merah Remaja Indonesia. All Rights Reserved.
        </p>
      </footer>
    </div>
  )
}