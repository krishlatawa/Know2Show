import dns from "node:dns";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Permanently prioritize IPv4 over IPv6 on Windows/Node
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // Ignore on environments where already set
}

// 2. Create resilient PG connection pool
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000, // 10s timeout to allow Neon cold-start
  idleTimeoutMillis: 30000,
  max: 10,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis;

// Prevent multiple instances of Prisma Client in development HMR
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
