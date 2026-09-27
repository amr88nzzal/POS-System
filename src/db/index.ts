import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    const config = connectionString
      ? { connectionString }
      : {
          host: process.env.SQL_HOST || process.env.POSTGRES_HOST || 'postgres',
          port: process.env.SQL_PORT || process.env.POSTGRES_PORT ? parseInt(process.env.SQL_PORT || process.env.POSTGRES_PORT || '5432', 10) : 5432,
          user: process.env.SQL_USER || process.env.POSTGRES_USER || 'postgres',
          password: process.env.SQL_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
          database: process.env.SQL_DB_NAME || process.env.POSTGRES_DB || 'pos_db',
          max: 10,
          connectionTimeoutMillis: 15000,
        };

    global._postgresPool = new Pool(config);

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
