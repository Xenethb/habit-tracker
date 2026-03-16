import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqpxhblehqbstagvfypj.supabase.co'
const supabaseAnonKey = 'sb_publishable_-snOoFI_IhK0oM2s_BXYXw_PXitOhMV'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)