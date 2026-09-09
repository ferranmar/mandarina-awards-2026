export default defineEventHandler(async (event) => {
  const { password } = await readBody(event)

  if (!process.env.ADMIN_PASSWORD) {
    throw createError({ statusCode: 500, statusMessage: 'ADMIN_PASSWORD no está configurado en el servidor' })
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    throw createError({ statusCode: 401, statusMessage: 'Contraseña incorrecta' })
  }

  setCookie(event, 'admin_token', password, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/'
  })

  return { ok: true }
})
