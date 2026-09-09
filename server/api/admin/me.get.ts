export default defineEventHandler((event) => {
  const token = getCookie(event, 'admin_token')
  return { isAdmin: !!token && !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD }
})
