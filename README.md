# Premios entre amigos

App de votación en vivo para premios entre amigos, hecha con **Nuxt 3** (Vue) y un backend real:

- **Base de datos:** SQLite (vía `better-sqlite3`), un solo archivo en `data/premios.db`.
- **Registro:** cada persona entra solo con su nombre (sin contraseña), y el servidor le asigna una cookie para recordar quién es y qué votó.
- **Tiempo real:** un WebSocket (`/api/ws`) empuja el estado actualizado a todos los navegadores conectados en cuanto alguien vota.
- **Panel de anfitrión:** protegido con una contraseña de servidor (variable `ADMIN_PASSWORD`), para crear categorías, abrir/cerrar votaciones y reiniciar votos.

## Correr en local

```bash
pnpm install
cp .env.example .env
# edita .env y pon tu propia ADMIN_PASSWORD
pnpm run dev
```

Abre `http://localhost:3000`. Para que tus amigos voten desde sus celulares en la misma red, comparte tu IP local (ej. `http://192.168.1.23:3000`) — asegúrate de que el firewall lo permita.

## Compilar para producción

```bash
pnpm run build
node .output/server/index.mjs
```

El servidor arranca en el puerto `3000` por defecto (usa `PORT=xxxx` para cambiarlo).

## Desplegarla en internet — recomendación

Esta app guarda sus datos en un **archivo SQLite en disco**, así que necesita un servidor con almacenamiento persistente y proceso siempre encendido — no una plataforma "serverless" pura (esas resetean el disco en cada ejecución). Las opciones más simples:

### Opción recomendada: Render.com
1. Sube este proyecto a un repositorio de GitHub.
2. En Render, crea un **Web Service** nuevo apuntando a ese repo.
3. Build command: `npm install && npm run build`
4. Start command: `node .output/server/index.mjs`
5. Agrega un **Disk** (almacenamiento persistente) montado en `/opt/render/project/src/data`, y define la variable de entorno `DB_PATH=/opt/render/project/src/data/premios.db`.
6. Define la variable de entorno `ADMIN_PASSWORD` con tu contraseña de anfitrión.
7. Despliega. Render te da una URL pública que puedes compartir con tus amigos.

### Otras opciones válidas
- **Railway** o **Fly.io**: mismo esquema (proceso persistente + volumen para `data/`).
- Un **VPS** cualquiera (DigitalOcean, un droplet, etc.) corriendo Node + `pm2`.

### Lo que NO funciona bien tal cual
- **Vercel / Netlify (funciones serverless)**: no tienen disco persistente entre invocaciones, así que la base de datos SQLite se perdería. Si más adelante quieres usar Vercel, te puedo adaptar el backend para usar una base de datos remota (ej. Turso o Supabase) en vez de SQLite local — avísame si quieres ese cambio.

## Variables de entorno

| Variable         | Descripción                                         | Ejemplo                  |
|------------------|------------------------------------------------------|---------------------------|
| `ADMIN_PASSWORD` | Contraseña para entrar al panel de anfitrión         | `fiesta2026`              |
| `DB_PATH`        | Ruta del archivo SQLite                              | `./data/premios.db`       |
| `PORT`           | Puerto del servidor (en producción)                  | `3000`                    |

## Estructura del proyecto

```
pages/index.vue          → toda la interfaz (registro, votar, panel de anfitrión)
server/api/*.ts          → endpoints REST (registro, votar, admin)
server/routes/api/ws.ts  → endpoint de WebSocket para tiempo real
server/utils/db.ts       → conexión SQLite y esquema de tablas
assets/main.css          → estilos (tema de gala de premios)
```
