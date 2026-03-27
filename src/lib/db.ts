import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!import.meta.env.VITE_DATABASE_URL && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL!);
export const db = drizzle(sql);
