const db = process.env.DATABASE_URL;
const jwt = process.env.JWT_SECRET;
const missing = process.env.MISSING_FEATURE_FLAG;

export { db, jwt, missing };
