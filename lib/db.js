import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;

// During build-time, DATABASE_URL might not be defined. We handle this gracefully to avoid build crashes.
export const sql = dbUrl ? neon(dbUrl) : (strings, ...values) => {
  console.warn("DATABASE_URL is not defined. Returning empty array.");
  return [];
};

if (dbUrl) {
  sql.query = (queryStr, params) => neon(dbUrl).query(queryStr, params);
} else {
  sql.query = async (queryStr, params) => {
    console.warn("DATABASE_URL is not defined. Returning empty query result.");
    return [];
  };
}

