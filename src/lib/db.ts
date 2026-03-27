import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const dbUrl = import.meta.env.VITE_DATABASE_URL;

if (!dbUrl) {
  throw new Error('VITE_DATABASE_URL is not set in environment variables');
}

const sql = neon(dbUrl);
export const db = drizzle(sql);
