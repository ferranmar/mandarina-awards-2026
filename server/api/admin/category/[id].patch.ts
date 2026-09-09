import { db } from '../../../utils/db'
import { requireAdmin } from '../../../utils/adminAuth'
import { broadcastState } from '../../../utils/broadcast'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const { status } = await readBody(event)

  if (status !== 'open' && status !== 'closed') {
    throw createError({ statusCode: 400, statusMessage: 'Estado inválido' })
  }

  db.prepare('UPDATE categories SET status = ? WHERE id = ?').run(status, id)
  broadcastState()
  return { ok: true }
})
