import type { H3Event } from 'h3'

export function requireAdmin(event: H3Event) {
  const token = getCookie(event, 'admin_token')
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !token || token !== expected) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }
}
