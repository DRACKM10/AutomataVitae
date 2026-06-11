import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Faltan variables de entorno para Supabase.');
}

(global as any).WebSocket = WebSocket;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);