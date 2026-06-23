const databaseUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;

export function getDatabaseUrl(): string | undefined {
  return databaseUrl;
}

export function getJwtSecret(): string | undefined {
  return jwtSecret;
}
