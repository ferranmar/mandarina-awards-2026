import { db } from '../../../utils/db'
import { requireAdmin } from '../../../utils/adminAuth'
import { broadcastState } from '../../../utils/broadcast'

export default defineEventHandler((event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')

  db.prepare('DELETE FROM votes WHERE category_id = ?').run(id)
  db.prepare('DELETE FROM nominees WHERE category_id = ?').run(id)
  db.prepare('DELETE FROM categories WHERE id = ?').run(id)

  broadcastState()
  return { ok: true }
})
