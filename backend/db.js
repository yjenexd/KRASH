import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize database tables
export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sounds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        signature JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS detections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#3b82f6',
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audio_files (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        data BYTEA NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Insert default settings if none exist
      INSERT INTO settings (key, value)
      VALUES ('app_settings', '{"sensitivity": 50, "hapticSync": true, "notifications": true, "soundAlerts": false, "darkMode": true}')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ Database tables initialized');
  } finally {
    client.release();
  }
}

export default pool;
