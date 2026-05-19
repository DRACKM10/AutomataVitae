const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Nos conectamos a la base de datos principal de Supabase (la misma que usa la IA)
const pool = new Pool({
  connectionString: 'postgresql://postgres:ox8YVkwGUyXRe0Vt@db.ovgffrzcgwqgewvhhdcx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false } // Requerido para Supabase
});

async function runInit() {
  try {
    const sqlPath = path.join(__dirname, 'database_init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Conectando a Supabase...');
    console.log('Ejecutando comandos de creación de tablas...');
    
    // Ejecutamos todo el SQL de corrido
    await pool.query(sql);
    
    console.log('✅ ¡Las tablas de users y resumes han sido creadas exitosamente!');
  } catch (error) {
    console.error('❌ Error al inicializar las tablas:', error);
  } finally {
    await pool.end();
  }
}

runInit();
