import { nanoid } from 'nanoid'
import { db } from '../../utils/db'
import { requireAdmin } from '../../utils/adminAuth'
import { broadcastState } from '../../utils/broadcast'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const { name, nominees } = await readBody(event)
  const cleanName = String(name || '').trim()
  const cleanNominees = (Array.isArray(nominees) ? nominees : [])
    .map((n: string) => String(n || '').trim())
    .filter(Boolean)

  if (!cleanName || cleanNominees.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Nombre y al menos 2 nominados son requeridos' })
  }

  const maxPos = (db.prepare('SELECT COALESCE(MAX(position), -1) as m FROM categories').get() as any).m
  const catId = nanoid()
  db.prepare('INSERT INTO categories (id, name, status, position) VALUES (?, ?, ?, ?)').run(catId, cleanName, 'open', maxPos + 1)

  const insertNominee = db.prepare('INSERT INTO nominees (id, category_id, name) VALUES (?, ?, ?)')
  cleanNominees.forEach((n: string) => insertNominee.run(nanoid(), catId, n))

  broadcastState()
  return { ok: true, id: catId }
})
