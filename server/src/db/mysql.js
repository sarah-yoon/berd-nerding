const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
const config = require('../config')

const pool = mysql.createPool({
  host:     config.db.host,
  port:     config.db.port,
  database: config.db.name,
  user:     config.db.user,
  password: config.db.password,
  waitForConnections: true,
  connectionLimit: 10,
})

async function runSetup() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../db/setup.sql'), 'utf8'
  )
  const statements = sql.split(';').filter(s => s.trim())
  for (const stmt of statements) {
    await pool.query(stmt)
  }
  console.log('Database setup complete')
  process.exit(0)
}

module.exports = { pool, runSetup }
