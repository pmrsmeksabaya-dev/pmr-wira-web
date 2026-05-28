import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kavcdotbteecdmgevxta.supabase.co'
const supabaseAnonKey = 'sb_publishable_Ehpztxuay8Zb5vP_DSC_oA_4XLVF1ra'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)