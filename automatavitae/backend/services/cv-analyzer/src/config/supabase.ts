import { createClient } from '@supabase/supabase-js';

// Verificar que existan las variables de entorno
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('❌ SUPABASE_URL y SUPABASE_ANON_KEY deben estar configuradas en .env');
}

// Crear cliente de Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);