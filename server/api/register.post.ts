import { nanoid } from 'nanoid'
import { db } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = String(body?.name || '').trim().slice(0, 60)
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Falta el nombre' })
  }

  let voterId = getCookie(event, 'voter_id')
  if (!voterId) {
    voterId = nanoid()
  }

  const existing = db.prepare('SELECT id FROM voters WHERE id = ?').get(voterId)
  if (existing) {
    db.prepare('UPDATE voters SET name = ? WHERE id = ?').run(name, voterId)
  } else {
    db.prepare('INSERT INTO voters (id, name, created_at) VALUES (?, ?, ?)').run(voterId, name, Date.now())
  }

  setCookie(event, 'voter_id', voterId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })

  return { id: voterId, name }
})
