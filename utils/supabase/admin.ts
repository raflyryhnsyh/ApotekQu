import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const createAdminClient = () => {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase URL or Service Role Key')
    }
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            // Agar tidak ada sesi yang terpasang pada client admin
            persistSession: false,
            autoRefreshToken: false,
        }
    })
}