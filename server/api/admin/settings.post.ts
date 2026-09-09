import { db } from '../../utils/db'
import { requireAdmin } from '../../utils/adminAuth'
import { broadcastState } from '../../utils/broadcast'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const { title, subtitle } = await readBody(event)

  db.prepare(`
    UPDATE settings
    SET title = COALESCE(NULLIF(?, ''), title),
        subtitle = COALESCE(NULLIF(?, ''), subtitle)
    WHERE id = 1
  `).run(String(title || ''), String(subtitle || ''))

  broadcastState()
  return { ok: true }
})
