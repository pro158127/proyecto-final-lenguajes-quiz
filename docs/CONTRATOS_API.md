# Contrato HTTP del backend Next.js

## Decisión de arquitectura

El frontend llama al backend del mismo proyecto mediante Route Handlers de **Next.js sobre Node.js**. Los handlers validan HTTP, llaman a servicios/dominio y usan Supabase en el servidor. El navegador nunca llama a Supabase, nunca envía `score` y nunca recibe la respuesta correcta antes de confirmar la pregunta.

> La referencia a NestJS se interpreta como Next.js, según la corrección indicada por el equipo. Los endpoints de este documento son Route Handlers de Next.js; no usan NestJS.

La pantalla y la acción que dispara cada llamada están especificadas en [FRONTEND_INTERFACES.md](FRONTEND_INTERFACES.md).

## Convenciones para el cliente

- Base URL: `/api` en desarrollo y producción; mismo origen que el frontend.
- Requests con body: `Content-Type: application/json` y `Accept: application/json`.
- Respuestas: JSON y `Cache-Control: no-store`.
- Alias enviado por el cliente: 2–20 caracteres después de recortar espacios; el servidor devuelve y guarda el valor normalizado.
- IDs de pregunta: `q-01` a `q-10`, en el orden fijo de la partida. Estos IDs son posiciones de juego; el banco puede conservar otros IDs internos.
- IDs de opción: `A`, `B`, `C` o `D`.
- Las únicas llamadas que necesitan body son `POST /api/games` y `POST /api/games/{gameId}/answers`. `GET` no recibe body. Los endpoints de partida reciben un UUID generado por el servidor en `{gameId}`.
- El servidor calcula el puntaje a partir de las respuestas confirmadas: +10 por acierto y +0 por error.

## Tipos compartidos

### Pregunta pública

```json
{
  "id": "q-01",
  "position": 1,
  "total": 10,
  "prompt": "¿Qué significa «parce» en Antioquia?",
  "options": [
    { "id": "A", "label": "Una moneda antigua" },
    { "id": "B", "label": "Un baile típico" },
    { "id": "C", "label": "Amigo, compañero o parcero" },
    { "id": "D", "label": "Un plato de fríjoles" }
  ]
}
```

Este objeto **nunca** incluye la respuesta correcta ni la explicación. El handler la agrega a la retroalimentación después de recibir una respuesta válida.

### Resumen final

```json
{
  "id": "c5a6eb47-2af8-4d6c-a23b-5619cc362084",
  "alias": "Luna",
  "correctCount": 7,
  "incorrectCount": 3,
  "score": 70,
  "finishedAt": "2026-12-01T15:30:00.000Z"
}
```

Los UUID y la fecha del ejemplo son ilustrativos; el backend genera sus valores.

### Error común

```json
{
  "error": {
    "code": "INVALID_ALIAS",
    "message": "Escribe un alias de 2 a 20 caracteres."
  }
}
```

El cliente muestra `error.message`; no necesita interpretar texto propio del proveedor Supabase.

## Endpoints que consume el frontend

### A. Iniciar partida — `POST /api/games`

**Cuándo:** al pulsar **Iniciar partida** o **Jugar de nuevo**. Cada llamada válida crea una partida nueva.

**Body que envía el frontend**

| Campo | Tipo | Regla |
|---|---|---|
| `alias` | string | Obligatorio; 2–20 caracteres después de recortar espacios. |

```json
{ "alias": "  Luna  " }
```

No enviar `gameId`, preguntas, opciones correctas ni puntaje. El servidor recorta el alias y crea el estado inicial.

**Respuesta: `201 Created`**

```json
{
  "gameId": "9f37637f-2347-41ee-b366-7391cd2035ec",
  "status": "IN_PROGRESS",
  "progress": { "answered": 0, "total": 10 },
  "question": {
    "id": "q-01",
    "position": 1,
    "total": 10,
    "prompt": "¿Qué significa «parce» en Antioquia?",
    "options": [
      { "id": "A", "label": "Una moneda antigua" },
      { "id": "B", "label": "Un baile típico" },
      { "id": "C", "label": "Amigo, compañero o parcero" },
      { "id": "D", "label": "Un plato de fríjoles" }
    ]
  }
}
```

El frontend guarda `gameId` en la URL `/game/{gameId}` y muestra `question`.

**Errores**

| HTTP | Código | Acción en la interfaz |
|---|---|---|
| `400` | `INVALID_REQUEST` | Indicar que la solicitud no tiene JSON con el formato esperado. |
| `400` | `INVALID_ALIAS` | Mantener al usuario en Inicio, enfocar Alias y mostrar el mensaje. |
| `503` | `STORAGE_UNAVAILABLE` | No iniciar la pantalla de juego; mostrar error y opción Reintentar. |

### B. Recuperar partida — `GET /api/games/{gameId}`

**Cuándo:** al entrar directamente a `/game/{gameId}` o recargar una página. No lleva body.

**Respuesta: `200 OK`, partida activa**

```json
{
  "gameId": "9f37637f-2347-41ee-b366-7391cd2035ec",
  "status": "IN_PROGRESS",
  "progress": { "answered": 1, "total": 10 },
  "question": {
    "id": "q-02",
    "position": 2,
    "total": 10,
    "prompt": "¿Qué significa «rolo» en Bogotá?",
    "options": [
      { "id": "A", "label": "Un tipo de pan" },
      { "id": "B", "label": "Un bus de la ciudad" },
      { "id": "C", "label": "Un instrumento musical" },
      { "id": "D", "label": "Persona nacida en Bogotá" }
    ]
  }
}
```

**Respuesta: `200 OK`, partida terminada**

```json
{
  "gameId": "9f37637f-2347-41ee-b366-7391cd2035ec",
  "status": "COMPLETED",
  "result": {
    "id": "c5a6eb47-2af8-4d6c-a23b-5619cc362084",
    "alias": "Luna",
    "correctCount": 7,
    "incorrectCount": 3,
    "score": 70,
    "finishedAt": "2026-12-01T15:30:00.000Z"
  }
}
```

**Errores:** `400 INVALID_REQUEST` si `gameId` no tiene formato UUID; `404 GAME_NOT_FOUND`; `410 GAME_EXPIRED`; `503 STORAGE_UNAVAILABLE`. Una sesión expirada no es un resultado terminado ni aparece en el ranking.

### C. Confirmar respuesta — `POST /api/games/{gameId}/answers`

**Cuándo:** al pulsar **Confirmar respuesta** con una opción seleccionada. La selección por sí sola no llama a la API.

**Body que envía el frontend**

| Campo | Tipo | Regla |
|---|---|---|
| `questionId` | string | Obligatorio; ID de secuencia `q-01` a `q-10`. Debe ser la pregunta vigente. |
| `selectedOptionId` | string | Obligatorio; uno de `A`, `B`, `C` o `D`. |

```json
{
  "questionId": "q-01",
  "selectedOptionId": "C"
}
```

No enviar `isCorrect`, `correctOptionId`, `score`, `correctCount` ni `nextQuestion`. El cliente solo envía el ID de pregunta vigente y la opción que eligió.

**Respuesta: `200 OK`, quedan preguntas**

```json
{
  "gameId": "9f37637f-2347-41ee-b366-7391cd2035ec",
  "status": "IN_PROGRESS",
  "acceptedQuestionId": "q-01",
  "isCorrect": true,
  "correctOptionId": "C",
  "progress": { "answered": 1, "total": 10 },
  "nextQuestion": {
    "id": "q-02",
    "position": 2,
    "total": 10,
    "prompt": "¿Qué significa «rolo» en Bogotá?",
    "options": [
      { "id": "A", "label": "Un tipo de pan" },
      { "id": "B", "label": "Un bus de la ciudad" },
      { "id": "C", "label": "Un instrumento musical" },
      { "id": "D", "label": "Persona nacida en Bogotá" }
    ]
  }
}
```

El frontend deshabilita las opciones y muestra el feedback (`isCorrect` y, si desea resaltar, `correctOptionId`). Espera a que el usuario pulse **Continuar** antes de mostrar `nextQuestion`; ese botón no hace otra llamada.

**Respuesta: `200 OK`, décima respuesta**

```json
{
  "gameId": "9f37637f-2347-41ee-b366-7391cd2035ec",
  "status": "COMPLETED",
  "acceptedQuestionId": "q-10",
  "isCorrect": false,
  "correctOptionId": "A",
  "progress": { "answered": 10, "total": 10 },
  "nextQuestion": null,
  "result": {
    "id": "c5a6eb47-2af8-4d6c-a23b-5619cc362084",
    "alias": "Luna",
    "correctCount": 7,
    "incorrectCount": 3,
    "score": 70,
    "finishedAt": "2026-12-01T15:30:00.000Z"
  }
}
```

El backend confirma la persistencia antes de responder `COMPLETED`. Si la respuesta final devuelve error, la interfaz no anuncia un resultado guardado. Repetir exactamente el mismo body para la última pregunta devuelve la misma respuesta sin insertar otro registro.

**Errores**

| HTTP | Código | Cuándo / acción |
|---|---|---|
| `400` | `INVALID_REQUEST` | Body ausente o JSON inválido; informar y permitir reintentar. |
| `400` | `INVALID_ANSWER` | El ID de pregunta tiene formato inválido o `selectedOptionId` no es `A`, `B`, `C` o `D`; pedir una opción válida. |
| `404` | `GAME_NOT_FOUND` | El `gameId` no existe; ofrecer volver a Inicio. |
| `409` | `QUESTION_OUT_OF_ORDER` | El `questionId` no es el vigente; recuperar con `GET /api/games/{gameId}`. |
| `409` | `QUESTION_ALREADY_ANSWERED` | Se intentó cambiar una opción ya confirmada; recuperar el estado. |
| `409` | `GAME_ALREADY_COMPLETED` | La partida ya terminó; navegar a Resultado. |
| `410` | `GAME_EXPIRED` | La sesión expiró; iniciar una partida nueva. |
| `503` | `STORAGE_UNAVAILABLE` | No se pudo guardar/leer; mostrar error y permitir reintentar sin fingir éxito. |

Un reintento idéntico de una respuesta ya procesada es idempotente: el backend devuelve el mismo feedback. Reintentar con otra opción para la misma pregunta no altera el registro.

### D. Consultar clasificación — `GET /api/leaderboard?limit=5`

**Cuándo:** al entrar a `/leaderboard` o pulsar **Ver clasificación**. No lleva body. `limit` es opcional y el frontend enviará `5`.

**Respuesta: `200 OK`**

```json
{
  "items": [
    {
      "rank": 1,
      "alias": "Luna",
      "correctCount": 10,
      "incorrectCount": 0,
      "score": 100,
      "finishedAt": "2026-12-01T15:30:00.000Z"
    },
    {
      "rank": 2,
      "alias": "Mateo",
      "correctCount": 9,
      "incorrectCount": 1,
      "score": 90,
      "finishedAt": "2026-12-01T14:20:00.000Z"
    }
  ]
}
```

`items` puede estar vacío. Si hay más registros, la API devuelve como máximo cinco. Ordena por puntaje descendente y, en empate, por consecutivo de registro ascendente. La interfaz representa el array recibido sin reordenarlo.

**Errores:** `400 INVALID_LIMIT` si el límite no es entero entre 1 y 5; `503 STORAGE_UNAVAILABLE` si falla Supabase. Un error no se presenta como lista vacía.

## Matriz compacta de request/response

| Acción de frontend | Método y ruta | Body request | Éxito |
|---|---|---|---|
| Iniciar o replay | `POST /api/games` | `{ "alias": "Luna" }` | `201`: `gameId`, `status`, `progress`, `question` |
| Abrir/recuperar juego | `GET /api/games/{gameId}` | Ninguno | `200`: partida activa (`question`) o terminada (`result`) |
| Confirmar opción | `POST /api/games/{gameId}/answers` | `{ "questionId": "q-01", "selectedOptionId": "C" }` | `200`: feedback y siguiente pregunta, o resultado final |
| Abrir ranking | `GET /api/leaderboard?limit=5` | Ninguno | `200`: `{ "items": [...] }` |

## Límites de responsabilidad entre módulos

| Módulo | Contrato |
|---|---|
| UI Next.js | Recoge alias/opción, muestra respuesta del servidor, gestiona carga, feedback y errores. No calcula puntaje. |
| API Route Handler | Lee path/query/body, valida el formato HTTP y traduce errores a status JSON. |
| Servicio y dominio | Normalizan alias, seleccionan pregunta vigente, determinan acierto, evitan duplicado y calculan resultado. |
| Repositorio Supabase | Persiste sesiones y resultados y consulta top cinco. No recibe llamadas desde navegador. |
| Supabase | Aplica las restricciones de score, clave única de partida, bloqueo atómico de respuestas y orden de ranking. |

El body, la respuesta y los códigos de error de cada llamada son el acuerdo entre Jordan y backend. Cualquier cambio de campo o ruta debe actualizar este documento y la prueba del endpoint en el mismo PR.
