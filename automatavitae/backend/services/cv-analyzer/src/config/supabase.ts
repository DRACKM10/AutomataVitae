import { createClient } from '@supabase/supabase-js';

// Verificar que existan las variables de entorno
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!process.env.SUPABASE_URL || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL y SUPABASE_ANON_KEY (o SUPABASE_KEY) deben estar configuradas en .env');
}

// Crear cliente de Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseKey
);