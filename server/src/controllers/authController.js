const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../db/mysql')
const config = require('../config')

async function register(req, res) {
  const { email, password } = req.body
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length) {
    const err = new Error('Email already registered')
    err.status = 409
    throw err
  }
  const password_hash = await bcrypt.hash(password, 10)
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, password_hash]
  )
  const token = jwt.sign({ id: result.insertId, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
  res.status(201).json({ token })
}

async function login(req, res) {
  const { email, password } = req.body
  const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [email])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }
  const token = jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
  res.json({ token })
}

module.exports = { register, login }
