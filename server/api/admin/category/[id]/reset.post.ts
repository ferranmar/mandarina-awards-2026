import { db } from '../../../../utils/db'
import { requireAdmin } from '../../../../utils/adminAuth'
import { broadcastState } from '../../../../utils/broadcast'

export default defineEventHandler((event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')

  db.prepare('DELETE FROM votes WHERE category_id = ?').run(id)

  broadcastState()
  return { ok: true }
})
