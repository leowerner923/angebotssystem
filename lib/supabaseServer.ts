import { createClient } from '@supabase/supabase-js'

// Serverseitiger Client für API-Routen.
// Nutzt SUPABASE_SERVICE_ROLE_KEY (wenn gesetzt) um RLS zu umgehen,
// solange noch kein Auth-System aktiv ist (Phase 3).
// Fällt auf ANON_KEY zurück wenn kein Service-Key vorhanden.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
