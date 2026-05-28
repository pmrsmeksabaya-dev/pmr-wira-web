import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY)

const resend = new Resend(RESEND_API_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Tolak GET request
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: corsHeaders }
    )
  }

  try {
    const { email, nama, type, status } = await req.json()

    console.log('Received request:', { email, nama, type, status })

    if (!email || !nama) {
      return new Response(
        JSON.stringify({ error: 'Email and nama are required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    let subject = ''
    let html = ''

    if (type === 'pendaftaran') {
      subject = '✅ Pendaftaran PMR WIRA Berhasil!'
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dc2626; border-radius: 16px;">
          <div style="text-align: center;">
            <img src="https://kavcdotbteecdmgevxta.supabase.co/storage/v1/object/public/assets/pmr.jpg" alt="PMR" style="width: 80px; height: 80px; border-radius: 12px;">
            <h2 style="color: #dc2626;">PMR WIRA SMKN 1 PRINGGABAYA</h2>
          </div>
          <h3>Halo ${nama},</h3>
          <p>Pendaftaran Anda sebagai anggota PMR WIRA telah <strong style="color: #22c55e;">BERHASIL</strong>!</p>
          <p>Data Anda sedang kami proses. Status pendaftaran akan diinfokan melalui email ini.</p>
          <hr style="border: 1px solid #dc2626; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">© 2026 PMR WIRA SMKN 1 Pringgabaya</p>
        </div>
      `
    } else if (type === 'status_update') {
      const statusText = status === 'diterima' ? 'DITERIMA' : 'DITOLAK'
      const statusColor = status === 'diterima' ? '#22c55e' : '#ef4444'
      const statusMessage = status === 'diterima' 
        ? 'Selamat! Anda diterima menjadi anggota PMR WIRA.'
        : 'Mohon maaf, pendaftaran Anda belum dapat kami terima.'

      subject = `📋 Status Pendaftaran PMR WIRA: ${statusText}`
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dc2626; border-radius: 16px;">
          <div style="text-align: center;">
            <img src="https://kavcdotbteecdmgevxta.supabase.co/storage/v1/object/public/assets/pmr.jpg" alt="PMR" style="width: 80px; height: 80px; border-radius: 12px;">
            <h2 style="color: #dc2626;">PMR WIRA SMKN 1 PRINGGABAYA</h2>
          </div>
          <h3>Halo ${nama},</h3>
          <p>Status pendaftaran Anda telah diperbarui menjadi:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="background: ${statusColor}; color: white; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-size: 18px;">
              ${statusText}
            </span>
          </div>
          <p>${statusMessage}</p>
          <hr style="border: 1px solid #dc2626; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">© 2026 PMR WIRA SMKN 1 Pringgabaya</p>
        </div>
      `
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Use "pendaftaran" or "status_update"' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Kirim email via Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error in send-notification:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})