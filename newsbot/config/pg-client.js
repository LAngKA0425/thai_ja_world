/**
 * PostgreSQL 클라이언트.
 * 백엔드와 동일한 DB에 연결.
 * 환경변수: PG_DATABASE_URL
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.PG_DATABASE_URL || 'postgresql://taeja:changeme@localhost:5432/taeja',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default pool;
