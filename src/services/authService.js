import { supabase } from './supabaseClient'

export const loginAdmin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const logoutAdmin = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const isAdmin = async (userId) => {
  const { data, error } = await supabase
    .from('app_admins')
    .select('*')
    .eq('user_id', userId)
    .single()
  return !!data
}
