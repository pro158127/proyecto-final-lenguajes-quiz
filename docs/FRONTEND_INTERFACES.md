# Interfaces del frontend y llamadas a la API

## Alcance de interfaz

La guía del reto pide el recorrido de una trivia individual: iniciar con alias, responder diez preguntas de cuatro opciones, recibir confirmación de acierto/error, ver el resultado, consultar las cinco mejores partidas y volver a jugar. También pide teclado, mensajes claros y revisión en ventana estrecha. No pide cuentas, panel administrativo, editor de preguntas ni herramientas de gestión dentro del producto.

Por eso el sistema tendrá cuatro pantallas de usuario. La retroalimentación de respuesta es un estado de la pantalla de juego, no una quinta página. Las páginas usan Next.js App Router y el backend expone Route Handlers de Next.js sobre Node.js.

## Mapa de pantallas

| Pantalla | Ruta de frontend | Contenido y controles | Acción principal | API llamada |
|---|---|---|---|---|
| Inicio | `/` | Nombre/tema de la trivia, campo Alias, contador opcional “10 preguntas”, botón “Iniciar partida”. | Validar alias de 2–20 caracteres tras recortar espacios. Mostrar el error junto al campo. | `POST /api/games` |
| Partida | `/game/{gameId}` | Alias, “Pregunta N de 10”, enunciado, cuatro opciones como radios/botones, botón “Confirmar respuesta”. | Exigir selección, enviar una respuesta y bloquear controles mientras llega la respuesta. | `GET /api/games/{gameId}` al abrir/recargar; `POST /api/games/{gameId}/answers` al confirmar. |
| Resultado | `/result/{gameId}` | Alias, aciertos, errores y puntaje sobre 100. Confirmación de guardado. Botones “Ver clasificación”, “Jugar de nuevo” y “Cambiar alias”. | Mostrar el resultado devuelto por la última respuesta. Consultar clasificación solo cuando se abre esa vista. | `GET /api/games/{gameId}` si se recarga; `GET /api/leaderboard?limit=5` al elegir “Ver clasificación”; `POST /api/games` para otra partida. |
| Clasificación | `/leaderboard` | Hasta cinco filas: posición, alias, aciertos, errores, puntaje y fecha; estado vacío si no hay resultados. Botones “Jugar de nuevo” y “Volver al inicio”. | Consultar y representar el ranking en el orden recibido. | `GET /api/leaderboard?limit=5`; `POST /api/games` para jugar de nuevo con alias actual. |

### Estado de retroalimentación en la partida

Después de confirmar, la misma pantalla conserva la pregunta contestada, deshabilita sus opciones y muestra “Correcto” o “Incorrecto”. Para una respuesta incorrecta puede resaltar la opción correcta, que el backend incluye solo después de aceptar la respuesta. Un botón “Continuar” muestra la pregunta siguiente que ya vino en la respuesta de API; no hace una segunda llamada. En la décima respuesta, “Continuar” lleva al resultado.

La interfaz deshabilita “Confirmar respuesta” mientras la llamada está pendiente y después de aceptarse. El backend también bloquea una segunda puntuación, así que un doble clic o reintento de red no duplica el resultado.

## Contrato de cada interacción

### Inicio → crear partida

1. El usuario escribe un alias y pulsa **Iniciar partida**.
2. El cliente envía `{ "alias": "Luna" }` a `POST /api/games`.
3. Con `201`, conserva `gameId` en la URL y muestra la `question` y `progress` recibidas.
4. Con `400 INVALID_ALIAS`, permanece en inicio, enfoca el campo y presenta el mensaje de validación. Con `503 STORAGE_UNAVAILABLE`, ofrece reintentar sin afirmar que inició.

### Partida → confirmar respuesta

1. La selección de una opción es local; por sí sola no llama a la API.
2. El usuario confirma. El cliente envía `{ "questionId": "q-01", "selectedOptionId": "C" }` a `POST /api/games/{gameId}/answers`.
3. Con respuesta `IN_PROGRESS`, muestra la retroalimentación y guarda en estado de pantalla `nextQuestion` hasta que el usuario pulse **Continuar**.
4. Con respuesta `COMPLETED`, muestra la retroalimentación de la décima pregunta y conserva `result`; al continuar abre Resultado.
5. En errores `409`, `410` o `503`, muestra el mensaje del contrato y ofrece recuperar la partida o reintentar según el código. No incrementa el puntaje en el cliente.

### Resultado → clasificación / replay

- Resultado obtiene el resumen de la décima respuesta. Si la página se recarga, usa `GET /api/games/{gameId}` y recibe el resultado persistido.
- **Ver clasificación** navega a `/leaderboard`, que llama a `GET /api/leaderboard?limit=5`.
- **Jugar de nuevo** con el mismo alias vuelve a llamar `POST /api/games` con ese alias.
- **Cambiar alias** vuelve a Inicio y deja que el usuario introduzca otro alias. Los resultados previos no se borran.

### Clasificación

- En carga se muestra un indicador y se evita mostrar una lista antigua como si fuera actual.
- `200` con `items: []` presenta un mensaje de historial vacío y botón para jugar.
- `200` con resultados muestra exactamente el orden enviado por la API; los empates ya vienen resueltos por orden de registro.
- Ante error de lectura se conserva la opción de reintentar y no se muestra “sin partidas” como si fuera un resultado válido.

## Orden de llamadas

```mermaid
sequenceDiagram
    actor Jugador
    participant UI as Pantalla Next.js
    participant API as Route Handlers Next.js
    participant Dominio as Servicio y dominio
    participant DB as Supabase
    Jugador->>UI: Escribe alias e inicia
    UI->>API: POST /api/games
    API->>Dominio: Normalizar alias, crear Partida
    Dominio->>DB: Guardar sesión temporal
    DB-->>UI: 201 + gameId + pregunta pública
    Jugador->>UI: Elige opción y confirma
    UI->>API: POST /api/games/{id}/answers
    API->>Dominio: Validar orden y evaluar respuesta
    Dominio->>DB: Avanzar sesión de forma atómica
    DB-->>UI: Feedback + siguiente pregunta o resultado
    Jugador->>UI: Abre clasificación
    UI->>API: GET /api/leaderboard?limit=5
    API->>DB: Leer top cinco
    DB-->>UI: Lista ordenada
```

## Estados que debe diseñar Jordan

| Estado | Tratamiento visible |
|---|---|
| `loading` | Indicador y botón temporalmente deshabilitado; evitar dobles envíos. |
| `validation_error` | Mensaje asociado al alias o a la selección faltante; mantener el valor que el usuario escribió. |
| `in_progress` | Pregunta vigente, avance visible y opción seleccionada. |
| `feedback` | Respuesta bloqueada, acierto/error y botón **Continuar**. |
| `completed` | Resultado persistido, resumen de aciertos/errores/puntaje y opciones siguientes. |
| `leaderboard_empty` | Explicación breve de que aún no hay partidas y acción para empezar. |
| `api_error` | Mensaje claro con reintentar; no simular éxito ni convertir un fallo en ranking vacío. |

## Reglas visuales y teclado

- Usar etiquetas visibles para el campo de alias y agrupar las cuatro opciones con un nombre accesible.
- Permitir Tab/Shift+Tab, selección por teclado y activación con Enter/Espacio; mantener foco visible.
- Tras error de validación, mover el foco al campo/opciones que requieren corrección.
- Tras feedback, anunciar el resultado con una región accesible (`aria-live`) y enfocar **Continuar**.
- Revisar la pantalla en una ventana estrecha, sin scroll horizontal ni controles cortados.
- Evitar depender solo del color para indicar respuesta correcta o incorrecta.

## Responsabilidad por módulo

- Jordan: estructura visual, estados anteriores, navegación con teclado y viewport estrecho; conectar los controles usando un cliente API sin lógica de puntuación.
- Cristian: contratos HTTP, validación de entradas y dominio; el servidor determina acierto y puntaje.
- Daniel: persistencia, clasificación y orden de resultados.
- Todos: revisar el flujo completo contra RF1–RF7 y los escenarios P1–P7 antes de cerrar las issues.
