const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'garage_pnl',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (username) DO UPDATE SET 
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       full_name = EXCLUDED.full_name
       RETURNING id, username, role`,
      ['admin', passwordHash, 'admin', 'System Administrator']
    );
    
    console.log('✅ Admin user created/updated:', result.rows[0]);
    
    // Tạo thêm user demo
    const demoPasswordHash = await bcrypt.hash('demo123', 10);
    const demoResult = await pool.query(
      `INSERT INTO users (username, password_hash, role, full_name) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (username) DO NOTHING
       RETURNING id, username, role`,
      ['demo', demoPasswordHash, 'user', 'Demo User']
    );
    
    if (demoResult.rows.length > 0) {
      console.log('✅ Demo user created:', demoResult.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
