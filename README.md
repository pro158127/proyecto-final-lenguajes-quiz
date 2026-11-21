# Reto Quiz

Trivia web sobre regionalismos de Colombia para el proyecto final de Lenguajes de Programación. Usa Next.js sobre Node.js, Supabase para persistencia y Vercel para despliegue.

## Tema y preguntas

El banco fuente contiene 37 preguntas en `src/data/regionalismos_colombia.json`. Cada partida básica usa las diez preguntas fijas listadas en `src/data/seleccion_partida.json`, cubriendo diez regiones. La puntuación del juego es 10 por acierto y 0 por error; se ignora el puntaje variable del archivo fuente.

## Requisitos

- Node.js 20.9 o superior.
- Proyecto Supabase propio.
- Variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` para desarrollo y en el entorno de Vercel para despliegue. La clave de servicio solo se usa en el servidor; no la expongas ni la subas a Git.

## Instalación y ejecución

1. Instala dependencias con `npm ci`.
2. Copia `.env.example` a `.env.local` y completa las credenciales del proyecto Supabase.
3. Aplica el esquema de `supabase/migrations/20261121000000_quiz_schema.sql` en el proyecto Supabase.
4. Ejecuta `npm run dev` y abre `http://localhost:3000`.

La API usa las rutas descritas en [CONTRATOS_API.md](docs/CONTRATOS_API.md). Para una partida, llama a `POST /api/games`, `POST /api/games/{gameId}/answers` y `GET /api/leaderboard`.

## Pruebas

Ejecuta `npm test`. Las pruebas unitarias U1–U3 y las validaciones de alias y selección se ejecutan con el test runner integrado de Node.js, sin navegador ni conexión a Supabase.

Los escenarios manuales P1–P7 deben registrarse en la tabla de pruebas del roadmap/README cuando la interfaz esté integrada. Aún no se han ejecutado.

## Equipo

- Jordan Amezquita (`@amezquitaJordan`): frontend.
- Cristian David Sánchez Mosquera (`@pro158127`): dominio, API y pruebas unitarias (implementación en PR #16).
- Daniel Rueda (`@Danielrvasq`): conexión/configuración Supabase, clasificación, pruebas manuales P1–P7 y despliegue.
- Jordan mantiene toda la implementación del frontend.

## Documentación

- [Interfaces del frontend y llamadas API](docs/FRONTEND_INTERFACES.md)
- [Requisitos](docs/REQUISITOS.md)
- [Arquitectura y módulos](docs/ARQUITECTURA.md)
- [Contratos de API](docs/CONTRATOS_API.md)
- [Roadmap](docs/ROADMAP.md)
