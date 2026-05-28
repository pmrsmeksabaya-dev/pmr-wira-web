import { supabase } from './supabaseClient'

export const submitPendaftaran = async (formData) => {
  const { data, error } = await supabase
    .from('pendaftaran_pmr')
    .insert([formData])
    .select()
  return { data, error }
}

export const getAllPendaftaran = async () => {
  const { data, error } = await supabase
    .from('pendaftaran_pmr')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export const updateStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('pendaftaran_pmr')
    .update({ status })
    .eq('id', id)
    .select()
  return { data, error }
}

export const deletePendaftaran = async (id) => {
  const { error } = await supabase
    .from('pendaftaran_pmr')
    .delete()
    .eq('id', id)
  return { error }
}
