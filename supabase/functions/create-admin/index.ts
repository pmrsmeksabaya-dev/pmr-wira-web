import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    // PAKE NAMA YANG TIDAK DIAWALI SUPABASE_
    const supabaseAdmin = createClient(
      Deno.env.get('SB_URL') ?? '',
      Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders })
    }

    if (user.email !== 'pmrsmeksabaya@gmail.com') {
      return new Response(JSON.stringify({ error: 'Only owner can add admin' }), { status: 403, headers: corsHeaders })
    }

    const { email, password, created_by } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400, headers: corsHeaders })
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: corsHeaders })
    }

    const { error: insertError } = await supabaseAdmin
      .from('app_admins')
      .insert([{
        user_id: newUser.user.id,
        nama: `Admin ${email.split('@')[0]}`,
        email: email,
        created_by: created_by || user.email
      }])

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 400, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin created successfully'
    }), { status: 200, headers: corsHeaders })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})