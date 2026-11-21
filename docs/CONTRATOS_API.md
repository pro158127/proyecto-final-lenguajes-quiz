# Contratos entre módulos y API de Next.js

## Objetivo y decisiones

Este documento fija cómo viajan los datos entre la interfaz web, los Route Handlers de Next.js, la lógica del juego y Supabase. Next.js se ejecuta sobre Node.js y ofrece la interfaz y la API en el mismo proyecto. Supabase es el único servicio de persistencia.

La interfaz nunca decide el puntaje ni recibe la respuesta correcta antes de enviar una respuesta. El servidor valida cada acción y la lógica de dominio calcula el resultado. Las rutas de API usan el runtime Node.js de Next.js.

## Módulos y contratos internos

| Módulo | Recibe | Devuelve | No debe hacer |
|---|---|---|---|
| Interfaz (`app/`, componentes) | Acciones de usuario y respuestas HTTP JSON | Vistas y estados visuales | Consultar Supabase directamente, conocer la respuesta antes de confirmar o calcular el puntaje oficial. |
| Cliente API (`src/client/api-client.js`) | Comandos de interfaz | Tipos de respuesta o error normalizados | Contener secretos o reglas de puntuación. |
| API Next.js (`app/api/**/route.js`) | HTTP, parámetros y JSON | Códigos HTTP y DTO JSON | Renderizar interfaz ni duplicar reglas del dominio. |
| Servicio de partidas (`src/server/games/game-service.js`) | Comandos validados y repositorios | Pregunta pública, retroalimentación, resultado | Confiar en score/correctness enviado por el navegador. |
| Dominio (`src/domain/*`) | Pregunta, opción seleccionada y estado de partida | Decisión correcta/incorrecta, progreso y resultado | Depender de HTTP, React o Supabase. |
| Repositorio Supabase (`src/server/repositories/*`) | Operaciones tipadas de sesión/resultado | Registros persistidos o errores de datos | Exponer claves privadas o reglas visuales. |
| Clasificación (`src/server/leaderboard/leaderboard-service.js`) | Límite solicitado | Lista ordenada de resultados públicos | Devolver datos internos de sesión o respuestas del jugador. |

La comunicación interna es por llamadas de funciones y tipos compartidos, no por HTTP entre módulos del mismo servidor. Solo el navegador consume la API HTTP.

## Convenciones HTTP

- Base local: `/api`; en producción, el mismo origen del sitio.
- Formato: `application/json; charset=utf-8`.
- Alias: se normaliza recortando espacios; debe quedar entre 2 y 20 caracteres.
- Índices/IDs de pregunta y opción son opacos para el cliente; el cliente envía el ID de opción, no un puntaje.
- Ninguna respuesta de pregunta incluye `correctOptionId` hasta que la pregunta se haya confirmado.
- Los errores usan el mismo formato en todas las rutas.

### Error común

```json
{
  "error": {
    "code": "INVALID_ALIAS",
    "message": "Escribe un alias de 2 a 20 caracteres.",
    "details": { "field": "alias" }
  }
}
```

`details` puede omitirse. Códigos iniciales: `INVALID_ALIAS`, `INVALID_REQUEST`, `INVALID_LIMIT`, `INVALID_ANSWER`, `GAME_NOT_FOUND`, `GAME_EXPIRED`, `QUESTION_OUT_OF_ORDER`, `QUESTION_ALREADY_ANSWERED`, `GAME_ALREADY_COMPLETED`, `STORAGE_UNAVAILABLE`, `INTERNAL_ERROR`.

## Tipos JSON públicos

### Pregunta visible

```json
{
  "id": "q-03",
  "position": 3,
  "total": 10,
  "prompt": "Enunciado de ejemplo",
  "options": [
    { "id": "A", "label": "Opción A" },
    { "id": "B", "label": "Opción B" },
    { "id": "C", "label": "Opción C" },
    { "id": "D", "label": "Opción D" }
  ]
}
```

La respuesta correcta no aparece en este objeto. Los IDs de opciones son `A`, `B`, `C` y `D`; `position` empieza en 1.

### Resultado de partida

```json
{
  "id": "result-uuid",
  "alias": "Luna",
  "correctCount": 7,
  "incorrectCount": 3,
  "score": 70,
  "finishedAt": "2026-12-01T15:30:00.000Z"
}
```

## Endpoints

### 1. Crear partida — `POST /api/games`

**Solicitud**

```json
{ "alias": "  Luna  " }
```

**Éxito: `201 Created`**

```json
{
  "gameId": "game-uuid",
  "status": "IN_PROGRESS",
  "progress": { "answered": 0, "total": 10 },
  "question": { "id": "q-01", "position": 1, "total": 10, "prompt": "...", "options": [{ "id": "A", "label": "..." }, { "id": "B", "label": "..." }, { "id": "C", "label": "..." }, { "id": "D", "label": "..." }] }
}
```

Alias devuelto en el resultado será el alias ya normalizado. Entrada inválida: `400 INVALID_ALIAS`. Cada llamada válida crea una partida nueva; por eso “jugar de nuevo” vuelve a llamar a este endpoint.

### 2. Consultar estado actual — `GET /api/games/{gameId}`

Permite recuperar la pregunta vigente si el navegador se recarga. No devuelve respuestas correctas de preguntas pendientes.

**Éxito: `200 OK`**: mismo formato de estado que `POST /api/games`, con el progreso actual y pregunta pendiente. Si la partida ya terminó, responde `{ "gameId": "...", "status": "COMPLETED", "result": { ... } }`.

Errores: `404 GAME_NOT_FOUND`, `410 GAME_EXPIRED`. Una sesión incompleta expirada no aparece en el historial ni en el ranking.

### 3. Confirmar respuesta — `POST /api/games/{gameId}/answers`

**Solicitud**

```json
{ "questionId": "q-01", "selectedOptionId": "B" }
```

**Éxito intermedio: `200 OK`**

```json
{
  "gameId": "game-uuid",
  "status": "IN_PROGRESS",
  "acceptedQuestionId": "q-01",
  "isCorrect": true,
  "correctOptionId": "B",
  "progress": { "answered": 1, "total": 10 },
  "nextQuestion": { "id": "q-02", "position": 2, "total": 10, "prompt": "...", "options": [{ "id": "A", "label": "..." }, { "id": "B", "label": "..." }, { "id": "C", "label": "..." }, { "id": "D", "label": "..." }] }
}
```

La respuesta final usa `status: "COMPLETED"`, `nextQuestion: null` y agrega `result` con el tipo anterior. `isCorrect` y `correctOptionId` se revelan únicamente después de aceptar esa respuesta.

El backend valida que el juego siga activo, que `questionId` sea la pregunta vigente y que `selectedOptionId` pertenezca a ella. La misma pregunta y la misma opción repetidas devuelven la confirmación original sin volver a puntuar. Misma pregunta con opción distinta devuelve `409 QUESTION_ALREADY_ANSWERED`. Pregunta fuera de secuencia: `409 QUESTION_OUT_OF_ORDER`; selección desconocida: `400 INVALID_ANSWER`; juego cerrado: `409 GAME_ALREADY_COMPLETED`.

### 4. Consultar clasificación — `GET /api/leaderboard?limit=5`

`limit` se acepta entre 1 y 5 y por defecto es 5; valores fuera de rango se rechazan con `400 INVALID_LIMIT`.

**Éxito: `200 OK`**

```json
{
  "items": [
    { "rank": 1, "alias": "Luna", "correctCount": 10, "incorrectCount": 0, "score": 100, "finishedAt": "2026-12-01T15:30:00.000Z" }
  ]
}
```

Puede devolver `items: []`. Orden: `score DESC`, luego número consecutivo de registro (`sequence ASC`). El `finishedAt` se muestra en la interfaz, pero no resuelve empates porque su precisión temporal puede coincidir. El ranking incluye partidas terminadas solamente; el mismo alias puede aparecer varias veces.

## Persistencia y sesión en Supabase

Las funciones de Vercel pueden ejecutarse en instancias distintas, por eso la sesión activa no se conserva en memoria del proceso. Se recomienda una tabla `game_sessions` para el estado temporal y una tabla `game_results` para partidas completadas.

- `game_sessions`: `id`, `alias`, `current_position`, respuestas confirmadas, estado `IN_PROGRESS/COMPLETED`, última confirmación serializada para reintentos, `created_at`, `expires_at`. No es historial ni participa en clasificación; se puede borrar tras expirar.
- `game_results`: `id`, `sequence` consecutivo generado por la base de datos, `game_id` único, `alias`, `correct_count`, `score`, `created_at`. `game_id` evita duplicar el resultado; `sequence ASC` asegura que, con el mismo puntaje, aparezca primero quien registró antes.
- Las claves privadas Supabase se usan solo en las rutas servidoras. El navegador no tiene permisos para insertar ni modificar estos registros.
- Actualizar posición y respuesta debe ser atómico (transacción/RPC de Supabase o actualización condicional) para que dos confirmaciones simultáneas no puntúen doble.
- La escritura del resultado final y el cambio de estado deben ser consistentes; una repetición de la última solicitud devuelve el mismo resultado.

## Flujo de datos de punta a punta

1. Inicio: formulario → `POST /api/games` → validación de alias → banco/dominio → sesión temporal en Supabase → pregunta pública JSON → pantalla de juego.
2. Respuesta: selección en UI → `POST /api/games/{id}/answers` → validación de orden/duplicado → dominio calcula acierto → sesión avanza en Supabase → JSON de retroalimentación y siguiente pregunta → UI actualiza progreso.
3. Final: décima respuesta → dominio calcula conteo y puntaje → inserción idempotente en `game_results` → respuesta final JSON → pantalla de resumen.
4. Ranking: pantalla solicita `GET /api/leaderboard` → servicio consulta y ordena resultados → UI representa lista o estado vacío.

## Contratos para pruebas

- API: alias vacío, inválido y válido; partida recuperable; selección ausente/incorrecta/desconocida; pregunta repetida igual y distinta; respuesta final repetida; ranking vacío, con empates y más de cinco registros; fallo de Supabase.
- Interfaz: estados `loading`, `error`, `in progress`, `feedback`, `completed` y `empty`; nunca muestra un guardado exitoso antes de recibir confirmación del servidor.
- Dominio: reglas de alias, secuencia, acierto, error, duplicado y resultado se prueban sin navegador ni conexión a Supabase.
