const { pool } = require('../db/mysql')

async function list(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM sightings WHERE user_id = ? ORDER BY date DESC',
    [req.user.id]
  )
  res.json(rows)
}

async function create(req, res) {
  const { species_name, species_code, location_name, lat, lng, date, count = 1, notes } = req.body
  const [result] = await pool.query(
    `INSERT INTO sightings (user_id, species_name, species_code, location_name, lat, lng, date, count, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, species_name, species_code, location_name, lat, lng, date, count, notes]
  )
  const newId = result.insertId
  let isNewSpecies = false
  if (species_code) {
    const [existing] = await pool.query(
      'SELECT id FROM sightings WHERE user_id = ? AND species_code = ? AND id != ?',
      [req.user.id, species_code, newId]
    )
    isNewSpecies = existing.length === 0
  }
  const [rows] = await pool.query('SELECT * FROM sightings WHERE id = ?', [newId])
  res.status(201).json({ ...rows[0], isNewSpecies })
}

async function update(req, res) {
  const { id } = req.params
  const [rows] = await pool.query('SELECT user_id FROM sightings WHERE id = ?', [id])
  if (!rows[0]) { const e = new Error('Not found'); e.status = 404; throw e }
  if (rows[0].user_id !== req.user.id) { const e = new Error('Forbidden'); e.status = 403; throw e }
  const fields = ['species_name','species_code','location_name','lat','lng','date','count','notes']
  const updates = fields.filter(f => req.body[f] !== undefined)
  if (!updates.length) { const e = new Error('No fields to update'); e.status = 400; throw e }
  const setClauses = updates.map(f => `${f} = ?`).join(', ')
  const values = [...updates.map(f => req.body[f]), id]
  await pool.query(`UPDATE sightings SET ${setClauses} WHERE id = ?`, values)
  const [updated] = await pool.query('SELECT * FROM sightings WHERE id = ?', [id])
  if (!updated[0]) { const e = new Error('Not found'); e.status = 404; throw e }
  res.json(updated[0])
}

async function remove(req, res) {
  const { id } = req.params
  const [rows] = await pool.query('SELECT user_id FROM sightings WHERE id = ?', [id])
  if (!rows[0]) { const e = new Error('Not found'); e.status = 404; throw e }
  if (rows[0].user_id !== req.user.id) { const e = new Error('Forbidden'); e.status = 403; throw e }
  await pool.query('DELETE FROM sightings WHERE id = ?', [id])
  res.status(204).send()
}

module.exports = { list, create, update, remove }
