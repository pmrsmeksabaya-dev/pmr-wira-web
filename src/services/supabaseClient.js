import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://kavcdotbteecdmgevxta.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdmNkb3RidGVlY2RtZ2V2eHRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgwNzY3OCwiZXhwIjoyMDk0MzgzNjc4fQ.WvrhgeepzlcNV6Y3pQJHI9CVsEvJeFfgD9ACkniAqNI'
)