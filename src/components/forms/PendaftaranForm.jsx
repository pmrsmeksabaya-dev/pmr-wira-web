import React, { useState } from 'react'
import { submitPendaftaran } from '../../services/pendaftaranService'
import Button from '../common/Button'
import Input from '../common/Input'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

const PendaftaranForm = () => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nisn: '',
    kelas: '',
    jurusan: '',
    jenis_kelamin: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    no_hp: '',
    email: '',
    alasan_masuk_pmr: '',
    pengalaman_organisasi: '',
    izin_orangtua: false
  })
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await submitPendaftaran(formData)
      
      if (error) throw error
      
      setNotification({ type: 'success', message: 'Pendaftaran berhasil! Data Anda telah tersimpan.' })
      setFormData({
        nama_lengkap: '',
        nisn: '',
        kelas: '',
        jurusan: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        alamat: '',
        no_hp: '',
        email: '',
        alasan_masuk_pmr: '',
        pengalaman_organisasi: '',
        izin_orangtua: false
      })
    } catch (err) {
      setNotification({ type: 'error', message: 'Gagal mendaftar: ' + err.message })
    } finally {
      setLoading(false)
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const getNotifClass = () => {
    if (!notification) return ''
    if (notification.type === 'success') {
      return 'fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-900/90 border border-green-500'
    }
    return 'fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg bg-red-900/90 border border-red-500'
  }

  return (
    React.createElement(React.Fragment, null,
      notification && React.createElement('div', { className: getNotifClass() },
        React.createElement('div', { className: 'flex items-center space-x-2' },
          notification.type === 'success'
            ? React.createElement(CheckCircle, { className: 'w-5 h-5 text-green-400' })
            : React.createElement(XCircle, { className: 'w-5 h-5 text-red-400' }),
          React.createElement('p', { className: 'text-white text-sm' }, notification.message)
        )
      ),
      React.createElement('form', { onSubmit: handleSubmit, className: 'max-w-3xl mx-auto space-y-6' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          React.createElement(Input, { label: 'Nama Lengkap', name: 'nama_lengkap', value: formData.nama_lengkap, onChange: handleChange, required: true }),
          React.createElement(Input, { label: 'NISN', name: 'nisn', value: formData.nisn, onChange: handleChange, required: true })
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-gray-300 mb-2 text-sm font-medium' },
              'Kelas ', React.createElement('span', { className: 'text-red-500' }, '*')
            ),
            React.createElement('select', { name: 'kelas', value: formData.kelas, onChange: handleChange, required: true },
              React.createElement('option', { value: '' }, 'Pilih Kelas'),
              React.createElement('option', { value: '10' }, '10'),
              React.createElement('option', { value: '11' }, '11'),
              React.createElement('option', { value: '12' }, '12')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-gray-300 mb-2 text-sm font-medium' },
              'Jurusan ', React.createElement('span', { className: 'text-red-500' }, '*')
            ),
            React.createElement('select', { name: 'jurusan', value: formData.jurusan, onChange: handleChange, required: true },
              React.createElement('option', { value: '' }, 'Pilih Jurusan'),
              ['TKJ', 'RPL', 'Multimedia', 'Akuntansi', 'Pemasaran'].map(j =>
                React.createElement('option', { key: j, value: j }, j)
              )
            )
          )
        ),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-gray-300 mb-2 text-sm font-medium' },
            'Jenis Kelamin ', React.createElement('span', { className: 'text-red-500' }, '*')
          ),
          React.createElement('div', { className: 'flex space-x-6' },
            React.createElement('label', { className: 'flex items-center space-x-2 cursor-pointer' },
              React.createElement('input', { type: 'radio', name: 'jenis_kelamin', value: 'Laki-laki', checked: formData.jenis_kelamin === 'Laki-laki', onChange: handleChange, required: true, className: 'w-4 h-4' }),
              React.createElement('span', { className: 'text-gray-300' }, 'Laki-laki')
            ),
            React.createElement('label', { className: 'flex items-center space-x-2 cursor-pointer' },
              React.createElement('input', { type: 'radio', name: 'jenis_kelamin', value: 'Perempuan', checked: formData.jenis_kelamin === 'Perempuan', onChange: handleChange, required: true, className: 'w-4 h-4' }),
              React.createElement('span', { className: 'text-gray-300' }, 'Perempuan')
            )
          )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          React.createElement(Input, { label: 'Tempat Lahir', name: 'tempat_lahir', value: formData.tempat_lahir, onChange: handleChange, required: true }),
          React.createElement(Input, { label: 'Tanggal Lahir', name: 'tanggal_lahir', type: 'date', value: formData.tanggal_lahir, onChange: handleChange, required: true })
        ),
        React.createElement(Input, { label: 'Alamat Lengkap', name: 'alamat', value: formData.alamat, onChange: handleChange, required: true }),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          React.createElement(Input, { label: 'Nomor HP/WhatsApp', name: 'no_hp', value: formData.no_hp, onChange: handleChange, required: true }),
          React.createElement(Input, { label: 'Email', name: 'email', type: 'email', value: formData.email, onChange: handleChange, required: true })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-gray-300 mb-2 text-sm font-medium' },
            'Alasan Masuk PMR ', React.createElement('span', { className: 'text-red-500' }, '*')
          ),
          React.createElement('textarea', { name: 'alasan_masuk_pmr', value: formData.alasan_masuk_pmr, onChange: handleChange, required: true, rows: '4' })
        ),
        React.createElement('div', null,
          React.createElement('label', { className: 'block text-gray-300 mb-2 text-sm font-medium' }, 'Pengalaman Organisasi'),
          React.createElement('textarea', { name: 'pengalaman_organisasi', value: formData.pengalaman_organisasi, onChange: handleChange, rows: '3' })
        ),
        React.createElement('label', { className: 'flex items-start space-x-3 cursor-pointer' },
          React.createElement('input', { type: 'checkbox', name: 'izin_orangtua', checked: formData.izin_orangtua, onChange: handleChange, required: true, className: 'w-5 h-5 mt-1' }),
          React.createElement('span', { className: 'text-gray-300 text-sm' },
            'Saya telah mendapatkan izin dari orang tua/wali untuk mengikuti kegiatan PMR ',
            React.createElement('span', { className: 'text-red-500' }, '*')
          )
        ),
        React.createElement(Button, { type: 'submit', variant: 'primary', className: 'w-full', disabled: loading },
          loading
            ? React.createElement('span', { className: 'flex items-center justify-center space-x-2' },
                React.createElement(Loader, { className: 'w-5 h-5 animate-spin' }),
                React.createElement('span', null, 'Mengirim...')
              )
            : 'Daftar Sekarang \u{1F680}'
        )
      )
    )
  )
}

export default PendaftaranForm
