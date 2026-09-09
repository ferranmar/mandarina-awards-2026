import { db } from '../utils/db'
import { broadcastState } from '../utils/broadcast'

export default defineEventHandler(async (event) => {
  const voterId = getCookie(event, 'voter_id')
  if (!voterId) {
    throw createError({ statusCode: 401, statusMessage: 'Primero regístrate con tu nombre' })
  }

  const { categoryId, nomineeId } = await readBody(event)

  const cat = db.prepare('SELECT status FROM categories WHERE id = ?').get(categoryId) as any
  if (!cat) throw createError({ statusCode: 404, statusMessage: 'Categoría no encontrada' })
  if (cat.status !== 'open') throw createError({ statusCode: 403, statusMessage: 'La votación está cerrada' })

  const nominee = db.prepare('SELECT id FROM nominees WHERE id = ? AND category_id = ?').get(nomineeId, categoryId)
  if (!nominee) throw createError({ statusCode: 400, statusMessage: 'Nominado inválido' })

  db.prepare(`
    INSERT INTO votes (category_id, voter_id, nominee_id) VALUES (?, ?, ?)
    ON CONFLICT(category_id, voter_id) DO UPDATE SET nominee_id = excluded.nominee_id
  `).run(categoryId, voterId, nomineeId)

  broadcastState()
  return { ok: true }
})
