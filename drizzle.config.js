/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://neondb_owner:sepUoDhd94Si@ep-weathered-sea-a5oqgsx1.us-east-2.aws.neon.tech/ai-interview?sslmode=require'
    }
  };