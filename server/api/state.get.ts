import { db, getFullState } from '../utils/db'

export default defineEventHandler((event) => {
  const voterId = getCookie(event, 'voter_id') || null
  const state = getFullState()

  let myVotes: Record<string, string> = {}
  let voterName: string | null = null

  if (voterId) {
    const rows = db.prepare('SELECT category_id, nominee_id FROM votes WHERE voter_id = ?').all(voterId) as any[]
    rows.forEach(r => { myVotes[r.category_id] = r.nominee_id })
    const voterRow = db.prepare('SELECT name FROM voters WHERE id = ?').get(voterId) as any
    voterName = voterRow?.name || null
  }

  return { ...state, myVotes, voterId, voterName }
})
