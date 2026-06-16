const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    dialectOptions: {
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 2,
      acquire: 10000,
      idle: 30000,
      evict: 60000,
    }
  }
);

// Force utf8mb4 charset on all connections on startup
sequelize.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci').catch(() => {})

// Simple memory cache for frequent lookups
const cache = new Map()
const CACHE_TTL = 60_000 // 60 seconds

function cacheGet(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.value
}

function cacheSet(key, value) {
  cache.set(key, { value, ts: Date.now() })
}

function cacheClear() {
  cache.clear()
}

sequelize.cacheGet = cacheGet
sequelize.cacheSet = cacheSet
sequelize.cacheClear = cacheClear

module.exports = sequelize;
