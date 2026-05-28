import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Upload, Camera, Download, Share2, Printer } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import { useDevice } from '../../hooks/useWindowWidth'
import html2canvas from 'html2canvas'

export function Pendaftaran({ dark, s }) {
  const { isMobile, isTablet, isDesktop } = useDevice()
  const [form, setForm] = useState({
    nama_lengkap: '', nisn: '', kelas: '', jurusan: '', jenis_kelamin: '',
    tempat_lahir: '', tanggal_lahir: '', alamat: '', no_hp: '', email: '',
    golongan_darah: '', alasan_masuk_pmr: '', pengalaman_organisasi: '', izin_orangtua: false
  })
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notif, setNotif] = useState(null)
  const [errors, setErrors] = useState({})
  const [showCard, setShowCard] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const cardRef = useRef(null)

  // Responsive values
  const containerPadding = isMobile ? '70px 16px 40px' : isTablet ? '90px 24px 40px' : '100px 20px 40px'
  const formPadding = isMobile ? '20px' : isTablet ? '25px' : '35px'
  const titleFontSize = isMobile ? '1.5rem' : isTablet ? '1.8rem' : '2.2rem'

  const validateForm = () => {
    const ne = {}
    if (!form.nama_lengkap.trim()) ne.nama_lengkap = 'Nama lengkap wajib diisi'
    if (!form.nisn.trim()) ne.nisn = 'NISN wajib diisi'
    if (!form.kelas) ne.kelas = 'Kelas wajib dipilih'
    if (!form.jurusan) ne.jurusan = 'Jurusan wajib dipilih'
    if (!form.jenis_kelamin) ne.jenis_kelamin = 'Jenis kelamin wajib dipilih'
    if (!form.tempat_lahir.trim()) ne.tempat_lahir = 'Tempat lahir wajib diisi'
    if (!form.tanggal_lahir) ne.tanggal_lahir = 'Tanggal lahir wajib diisi'
    if (!form.alamat.trim()) ne.alamat = 'Alamat wajib diisi'
    if (!form.no_hp.trim()) ne.no_hp = 'Nomor HP wajib diisi'
    if (!form.email.trim()) ne.email = 'Email wajib diisi'
    if (!form.golongan_darah) ne.golongan_darah = 'Golongan darah wajib dipilih'
    if (!form.alasan_masuk_pmr.trim()) ne.alasan_masuk_pmr = 'Alasan masuk PMR wajib diisi'
    if (!form.izin_orangtua) ne.izin_orangtua = 'Izin orang tua wajib'
    if (!foto) ne.foto = 'Foto 3x4 wajib diupload'
    setErrors(ne)
    return Object.keys(ne).length === 0
  }

// ============ KIRIM NOTIFIKASI EMAIL ============
const sendEmailNotification = async (email, nama, type, status) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    const response = await fetch(`https://kavcdotbteecdmgevxta.supabase.co/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`
      },
      body: JSON.stringify({
        email,
        nama,
        type, // 'pendaftaran', 'status_update'
        status // 'diterima', 'ditolak' (untuk type status_update)
      })
    })
    
    const result = await response.json()
    console.log('Email notification:', result)
  } catch (error) {
    console.error('Gagal kirim email:', error)
  }
}

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFoto(file)
      setFotoPreview(URL.createObjectURL(file))
      if (errors.foto) setErrors(prev => ({ ...prev, foto: '' }))
    }
  }

  const uploadFoto = async (file) => {
    const fileName = 'foto/' + Date.now() + '_' + file.name
    const { error } = await supabase.storage.from('assets').upload(fileName, file)
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(fileName)
    return publicUrl
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!validateForm()) {
    setNotif({ type: 'error', text: 'Mohon lengkapi semua field!' })
    setTimeout(() => setNotif(null), 4000)
    return
  }
  setLoading(true)
  try {
    // ============ CEK EMAIL UNIK ============
    const { data: existingUser, error: checkError } = await supabase
      .from('pendaftaran_pmr')
      .select('email')
      .eq('email', form.email)
      .maybeSingle()
    
    if (existingUser) {
      setNotif({ type: 'error', text: '❌ Email sudah terdaftar! Gunakan email lain.' })
      setLoading(false)
      return
    }

    // Upload foto
    let fotoUrl = null
    if (foto) {
      try {
        fotoUrl = await uploadFoto(foto)
      } catch (uploadErr) {
        console.warn('⚠️ Upload foto gagal, lanjut tanpa foto:', uploadErr.message)
      }
    }

    const payload = {
      nama_lengkap: form.nama_lengkap,
      nisn: form.nisn,
      kelas: form.kelas,
      jurusan: form.jurusan,
      jenis_kelamin: form.jenis_kelamin,
      tempat_lahir: form.tempat_lahir,
      tanggal_lahir: form.tanggal_lahir,
      alamat: form.alamat,
      no_hp: form.no_hp,
      email: form.email,
      golongan_darah: form.golongan_darah || null,
      alasan_masuk_pmr: form.alasan_masuk_pmr,
      pengalaman_organisasi: form.pengalaman_organisasi || '',
      izin_orangtua: form.izin_orangtua,
      foto_url: fotoUrl || null,
      status: 'pending'
    }

    const { error } = await supabase.from('pendaftaran_pmr').insert([payload])
    if (error) throw error

    // ============ KIRIM NOTIFIKASI EMAIL ============
    await sendEmailNotification(form.email, form.nama_lengkap, 'pendaftaran', null)

    setSubmittedData(payload)
    setNotif({ type: 'success', text: '✅ Pendaftaran berhasil! Cek email untuk konfirmasi.' })
    setShowCard(true)
  } catch (err) {
    console.error('❌ Error:', err)
    setNotif({ type: 'error', text: '❌ Gagal: ' + err.message })
  } finally {
    setLoading(false)
    setTimeout(() => setNotif(null), 5000)
  }
}
  // ============ CETAK KARTU ============
const handleCetak = () => {
  const cardElement = document.getElementById('kartu-anggota')
  if (!cardElement) {
    alert('❌ Kartu tidak ditemukan!')
    return
  }

  // Ambil HTML kartu
  const cardHtml = cardElement.outerHTML
  
  // Buat window print
  const printWindow = window.open('', '_blank', 'width=500,height=700')
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Kartu Anggota Baru PMR</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f0f0f0;
            padding: 20px;
          }
          .card {
            background: white;
            border-radius: 16px;
            border: 3px solid #dc2626;
            padding: 20px;
            width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .header {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
          }
          .logo {
            width: 50px;
            height: 50px;
            object-fit: contain;
          }
          .title {
            text-align: center;
          }
          .title h2 {
            color: #dc2626;
            font-size: 1rem;
            margin: 0;
          }
          .title p {
            color: #666;
            font-size: 0.7rem;
            margin: 0;
          }
          hr {
            border: 1px solid #dc2626;
            margin: 10px 0;
          }
          .photo {
            text-align: center;
            margin-bottom: 15px;
          }
          .photo img {
            width: 100px;
            height: 133px;
            object-fit: cover;
            border-radius: 8px;
            border: 2px solid #dc2626;
          }
          table {
            width: 100%;
            font-size: 0.75rem;
            border-collapse: collapse;
          }
          td {
            padding: 5px 0;
          }
          .label {
            color: #dc2626;
            font-weight: bold;
            width: 40%;
          }
          .signature {
            text-align: right;
            margin-top: 15px;
          }
          .signature p {
            margin: 3px 0;
            font-size: 0.7rem;
          }
          .ttd {
            width: 100px;
            height: auto;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .card {
              box-shadow: none;
              border: 2px solid #dc2626;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        ${cardHtml}
        <script>
          // Tunggu gambar load, lalu print
          window.onload = function() {
            setTimeout(function() {
              window.print();
              // Jangan close otomatis, biar user yang tutup
              // window.close();
            }, 500);
          }
        <\/script>
      </body>
    </html>
  `)
  
  printWindow.document.close()
}

  // ============ DOWNLOAD KARTU ============
  const handleDownload = async () => {
    const cardElement = document.getElementById('kartu-anggota')
    if (!cardElement) {
      alert('❌ Kartu tidak ditemukan!')
      return
    }

    try {
      const canvas = await html2canvas(cardElement, { scale: 2, backgroundColor: '#ffffff' })
      const link = document.createElement('a')
      link.download = `kartu-anggota-${form.nama_lengkap || 'member'}.png`
      link.href = canvas.toDataURL()
      link.click()
      alert('✅ Kartu berhasil didownload!')
    } catch (error) {
      alert('❌ Gagal mendownload kartu!')
    }
  }

const handleShare = async () => {
  const cardElement = document.getElementById('kartu-anggota')
  if (!cardElement) {
    alert('❌ Kartu tidak ditemukan!')
    return
  }

  try {
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      backgroundColor: '#ffffff'
    })
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `kartu-anggota.png`, { type: 'image/png' })
      
      // Cek apakah browser support Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Kartu Anggota Baru PMR',
            text: `Kartu anggota Baru PMR WIRA - ${form.nama_lengkap || 'Anggota'}`,
            files: [file]
          })
          alert('✅ Berhasil dibagikan!')
        } catch (shareError) {
          if (shareError.name !== 'AbortError') {
            alert('❌ Gagal membagikan: ' + shareError.message)
          }
        }
      } else {
        // FALLBACK: Download aja (karena browser gak support share)
        const link = document.createElement('a')
        link.download = `kartu-anggota-${form.nama_lengkap || 'member'}.png`
        link.href = URL.createObjectURL(blob)
        link.click()
        alert('✅ Browser tidak support share, kartu sudah didownload!')
      }
    })
  } catch (error) {
    console.error('Gagal share:', error)
    alert('❌ Gagal membagikan kartu: ' + error.message)
  }
}

  const is = { 
    background: s.inputBg, border: s.inputBorder, color: s.inputColor, 
    padding: isMobile ? '10px 12px' : '12px 16px', borderRadius: '8px', 
    width: '100%', fontSize: isMobile ? '0.85rem' : '0.9rem', boxSizing: 'border-box' 
  }
  const es = { color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }

  if (showCard) {
  return (
    <div style={{ 
      padding: isMobile ? '70px 16px 40px' : '100px 20px 40px', 
      maxWidth: isMobile ? '100%' : '500px', 
      margin: '0 auto', 
      background: s.bg, 
      minHeight: '100vh' 
    }}>
      
      {/* KARTU ANGGOTA */}
      <div id="kartu-anggota" ref={cardRef} style={{ 
        background: '#fff', 
        borderRadius: '16px', 
        border: '3px solid #dc2626', 
        padding: isMobile ? '15px' : '20px', 
        width: isMobile ? '100%' : '380px',
        maxWidth: '380px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '3px', border: '1.5px solid #dc2626' }}>
            <img src="/pmr.jpg" alt="PMR" style={{ width: isMobile ? '40px' : '45px', height: isMobile ? '40px' : '45px', display: 'block' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#dc2626', fontSize: isMobile ? '0.9rem' : '1rem', margin: 0 }}>KARTU ANGGOTA BARU</h2>
            <p style={{ color: '#666', fontSize: isMobile ? '0.6rem' : '0.7rem', margin: 0 }}>PMR WIRA SMKN 1 PRINGGABAYA</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '3px', border: '1.5px solid #dc2626' }}>
            <img src="/pmi.jpg" alt="PMI" style={{ width: isMobile ? '40px' : '45px', height: isMobile ? '40px' : '45px', display: 'block' }} />
          </div>
        </div>
        
        <hr style={{ border: '1px solid #dc2626', margin: '10px 0' }} />
        
        {/* FOTO */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          {fotoPreview && (
            <img 
              src={fotoPreview} 
              alt="Foto" 
              style={{ 
                width: isMobile ? '80px' : '100px', 
                height: isMobile ? '106px' : '133px', 
                objectFit: 'cover', 
                borderRadius: '8px', 
                border: '2px solid #dc2626' 
              }} 
            />
          )}
        </div>
        
        {/* DATA DIRI */}
        <div style={{ marginBottom: '12px', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
          <div style={{ display: 'flex', marginBottom: '6px' }}>
            <div style={{ color: '#dc2626', fontWeight: 'bold', width: '100px', flexShrink: 0 }}>NAMA</div>
            <div style={{ color: '#333' }}>: {submittedData?.nama_lengkap || form.nama_lengkap || '-'}</div>
          </div>
          <div style={{ display: 'flex', marginBottom: '6px' }}>
            <div style={{ color: '#dc2626', fontWeight: 'bold', width: '100px', flexShrink: 0 }}>KELAS/JURUSAN</div>
            <div style={{ color: '#333' }}>: {submittedData?.kelas || form.kelas || '-'} / {submittedData?.jurusan || form.jurusan || '-'}</div>
          </div>
          <div style={{ display: 'flex', marginBottom: '6px' }}>
            <div style={{ color: '#dc2626', fontWeight: 'bold', width: '100px', flexShrink: 0 }}>ALAMAT</div>
            <div style={{ color: '#333' }}>: {submittedData?.alamat || form.alamat || '-'}</div>
          </div>
          <div style={{ display: 'flex', marginBottom: '6px' }}>
            <div style={{ color: '#dc2626', fontWeight: 'bold', width: '100px', flexShrink: 0 }}>GOL. DARAH</div>
            <div style={{ color: '#333' }}>: {submittedData?.golongan_darah || form.golongan_darah || '-'}</div>
          </div>
        </div>
        
        <hr style={{ border: '1px solid #dc2626', margin: '10px 0' }} />
        
        {/* TTD */}
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <p style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', margin: '3px 0' }}>Pringgabaya, {new Date().toLocaleDateString('id-ID')}</p>
          <p style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', margin: '3px 0' }}>Ketua PMR Wira</p>
          <div>
            <img src="/ttd.png" alt="TTD" style={{ width: isMobile ? '80px' : '100px', height: 'auto' }} />
          </div>
          <p style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: 'bold', margin: '3px 0', borderTop: '1px solid #333', display: 'inline-block', paddingTop: '5px' }}>Nadia Amanda Sari</p>
        </div>
      </div>
      
      {/* TOMBOL */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '12px', 
        marginTop: '25px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button onClick={handleCetak} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: isMobile ? '10px 20px' : '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: isMobile ? '120px' : '140px', justifyContent: 'center' }}>
            <Printer size={16} /> Cetak
          </button>
          <button onClick={handleDownload} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: isMobile ? '10px 20px' : '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: isMobile ? '120px' : '140px', justifyContent: 'center' }}>
            <Download size={16} /> Download
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button onClick={handleShare} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: isMobile ? '10px 20px' : '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: isMobile ? '120px' : '140px', justifyContent: 'center' }}>
            <Share2 size={16} /> Bagikan
          </button>
          <Link to="/">
            <button style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: isMobile ? '10px 20px' : '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', minWidth: isMobile ? '120px' : '140px', justifyContent: 'center' }}>
              🏠 Kembali
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

  return (
    <div style={{ padding: containerPadding, maxWidth: isMobile ? '100%' : isTablet ? '90%' : '800px', margin: '0 auto', background: s.bg, minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '6px', border: '2px solid #dc2626', display: 'inline-block' }}>
          <img src="/pmr.jpg" alt="PMR" style={{ width: isMobile ? '50px' : '65px', height: isMobile ? '50px' : '65px' }} />
        </div>
      </div>
      <h1 style={{ textAlign: 'center', color: s.text, textShadow: s.glow, fontSize: titleFontSize }}>Pendaftaran Anggota Baru</h1>
      <p style={{ textAlign: 'center', color: s.text2, marginBottom: '30px' }}>Isi formulir dibawah</p>

      {notif && (
        <div style={{ background: notif.type === 'success' ? '#166534' : '#991b1b', border: '1px solid ' + (notif.type === 'success' ? '#22c55e' : '#ef4444'), padding: '15px 20px', borderRadius: '10px', marginBottom: '25px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {notif.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}{notif.text}
        </div>
      )}

      <div style={{ background: s.card, border: s.cardBorder, padding: formPadding, borderRadius: '16px' }}>
        <form onSubmit={handleSubmit}>
          {/* Foto Upload */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: s.text2 }}>Foto Diri (Wajib) <span style={{ color: '#dc2626' }}>*</span></label>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '20px', padding: '15px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '15px', border: '2px dashed ' + (errors.foto ? '#ef4444' : 'rgba(220,38,38,0.3)') }}>
              <div style={{ width: '80px', height: '106px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(220,38,38,0.3)' }}>
                {fotoPreview ? <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color="rgba(255,255,255,0.3)" />}
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', borderRadius: '12px', cursor: 'pointer' }}>
                <Upload size={16} /><span>{fotoPreview ? 'Ganti Foto' : 'Pilih Foto'}</span>
                <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />
              </label>
            </div>
            <small style={{ display: 'block', marginTop: '8px', color: '#eab308', fontSize: '0.75rem' }}>* Foto wajib (max 2MB)</small>
            {errors.foto && <p style={es}>{errors.foto}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Nama Lengkap <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} style={{ ...is, borderColor: errors.nama_lengkap ? '#ef4444' : s.inputBorder }} placeholder="Masukkan nama lengkap" />
            {errors.nama_lengkap && <p style={es}>{errors.nama_lengkap}</p>}</div>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>NISN <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="nisn" value={form.nisn} onChange={handleChange} style={{ ...is, borderColor: errors.nisn ? '#ef4444' : s.inputBorder }} placeholder="Masukkan NISN" />
            {errors.nisn && <p style={es}>{errors.nisn}</p>}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Kelas <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="kelas" value={form.kelas} onChange={handleChange} style={{ ...is, borderColor: errors.kelas ? '#ef4444' : s.inputBorder }}>
              <option value="">Pilih Kelas</option><option value="10">10</option><option value="11">11</option><option value="12">12</option>
            </select>
            {errors.kelas && <p style={es}>{errors.kelas}</p>}</div>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Jurusan <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="jurusan" value={form.jurusan} onChange={handleChange} style={{ ...is, borderColor: errors.jurusan ? '#ef4444' : s.inputBorder }}>
  <option value="">Pilih Jurusan</option>
  <option value="TKJ">TKJ - Teknik Komputer dan Jaringan</option>
  <option value="RPL">RPL - Rekayasa Perangkat Lunak</option>
  <option value="TKP">TKP - Teknik Konstruksi Perumahan</option>
  <option value="DPIB">DPIB - Desain Pemodelan dan Informasi Bangunan</option>
  <option value="TPM">TPM - Teknik Pemesinan</option>
  <option value="TKR">TKR - Teknik Kendaraan Ringan</option>
  <option value="TPL">TPL - Teknik Pengelasan</option>
  <option value="TSM">TSM - Teknik Sepeda Motor</option>
  <option value="TPTU">TPTU - Teknik Pendingin dan Tata Udara</option>
  <option value="TITL">TITL - Teknik Instalasi Tenaga Listrik</option>
  <option value="TAV">TAV - Teknik Audio Video</option>
  <option value="TJAT">TJAT - Teknik Jaringan Akses dan Telekomunikasi</option>
  <option value="TELIN">TELIN - Teknik Elektronika Industri</option>
  <option value="TESHA">TESHA - Teknik Energi Surya Hidro dan Angin</option>
</select>
            {errors.jurusan && <p style={es}>{errors.jurusan}</p>}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Golongan Darah <span style={{ color: '#dc2626' }}>*</span></label>
            <select name="golongan_darah" value={form.golongan_darah} onChange={handleChange} style={{ ...is, borderColor: errors.golongan_darah ? '#ef4444' : s.inputBorder }}>
              <option value="">Pilih Gol. Darah</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
            </select>
            {errors.golongan_darah && <p style={es}>{errors.golongan_darah}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: s.text2, display: 'block', marginBottom: '10px' }}>Jenis Kelamin <span style={{ color: '#dc2626' }}>*</span></label>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : '30px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: s.text2 }}>
                <input type="radio" name="jenis_kelamin" value="Laki-laki" checked={form.jenis_kelamin === 'Laki-laki'} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#dc2626' }} />Laki-laki
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: s.text2 }}>
                <input type="radio" name="jenis_kelamin" value="Perempuan" checked={form.jenis_kelamin === 'Perempuan'} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#dc2626' }} />Perempuan
              </label>
            </div>
            {errors.jenis_kelamin && <p style={es}>{errors.jenis_kelamin}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Tempat Lahir <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="tempat_lahir" value={form.tempat_lahir} onChange={handleChange} style={{ ...is, borderColor: errors.tempat_lahir ? '#ef4444' : s.inputBorder }} placeholder="Masukkan tempat lahir" />
            {errors.tempat_lahir && <p style={es}>{errors.tempat_lahir}</p>}</div>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Tanggal Lahir <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange} style={{ ...is, borderColor: errors.tanggal_lahir ? '#ef4444' : s.inputBorder }} />
            {errors.tanggal_lahir && <p style={es}>{errors.tanggal_lahir}</p>}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Alamat <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="text" name="alamat" value={form.alamat} onChange={handleChange} style={{ ...is, borderColor: errors.alamat ? '#ef4444' : s.inputBorder }} placeholder="Masukkan alamat lengkap" />
            {errors.alamat && <p style={es}>{errors.alamat}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Nomor HP/WhatsApp <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="tel" name="no_hp" value={form.no_hp} onChange={handleChange} style={{ ...is, borderColor: errors.no_hp ? '#ef4444' : s.inputBorder }} placeholder="081234567890" />
            {errors.no_hp && <p style={es}>{errors.no_hp}</p>}</div>
            <div><label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Email <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="email" name="email" value={form.email} onChange={handleChange} style={{ ...is, borderColor: errors.email ? '#ef4444' : s.inputBorder }} placeholder="contoh@email.com" />
            {errors.email && <p style={es}>{errors.email}</p>}</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Alasan Masuk PMR <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea name="alasan_masuk_pmr" value={form.alasan_masuk_pmr} onChange={handleChange} rows="4" style={{ ...is, borderColor: errors.alasan_masuk_pmr ? '#ef4444' : s.inputBorder, resize: 'vertical' }} placeholder="Tuliskan alasan..." />
            {errors.alasan_masuk_pmr && <p style={es}>{errors.alasan_masuk_pmr}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: s.text2, display: 'block', marginBottom: '8px' }}>Pengalaman Organisasi</label>
            <textarea name="pengalaman_organisasi" value={form.pengalaman_organisasi} onChange={handleChange} rows="3" style={{ ...is, resize: 'vertical' }} placeholder="Ceritakan pengalaman..." />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" name="izin_orangtua" checked={form.izin_orangtua} onChange={handleChange} style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#dc2626' }} />
              <span style={{ color: s.text2, fontSize: isMobile ? '0.8rem' : '0.9rem' }}>Saya telah mendapatkan izin dari orang tua/wali <span style={{ color: '#dc2626' }}>*</span></span>
            </label>
            {errors.izin_orangtua && <p style={es}>{errors.izin_orangtua}</p>}
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: isMobile ? '12px' : '14px', fontSize: isMobile ? '1rem' : '1.1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Mengirim...' : 'Daftar Sekarang 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}