# Arquitectura del programa

## Decisión general

Aplicación web pequeña con frontend de navegador y backend Node.js desplegado como funciones de Vercel. Supabase proporciona la persistencia de partidas. El tema y el banco de preguntas son contenido versionado con el código; no se necesita editor ni administración de preguntas.

## Flujo principal

1. La interfaz solicita alias y realiza validación amigable.
2. El navegador pide comenzar una partida al backend Node.js.
3. La lógica de dominio valida el alias, carga preguntas y crea un estado de partida.
4. En cada respuesta, el backend valida selección y secuencia, registra el resultado de la pregunta y evita una segunda confirmación.
5. Al completar diez, el backend calcula resumen y persiste una sola partida en Supabase.
6. La clasificación solicita al backend los cinco mejores registros, ordenados por puntaje y fecha de creación.

El backend valida y calcula el puntaje; no confía en un total calculado solo por el navegador. Las credenciales privilegiadas de Supabase permanecen del lado servidor.

## Estructura propuesta

```text
.
├── api/
│   ├── game/                 # Entrada HTTP para iniciar y responder
│   └── leaderboard.js        # Consulta de clasificación
├── docs/
│   ├── REQUISITOS.md
│   ├── ARQUITECTURA.md
│   └── ROADMAP.md
├── public/
│   ├── index.html            # Inicio y contenedor de la aplicación
│   ├── styles.css
│   └── js/
│       ├── app.js            # Eventos y navegación visual
│       └── api-client.js     # Llamadas HTTP al backend
├── src/
│   ├── domain/
│   │   ├── question.js       # Entidad/reglas de Pregunta
│   │   ├── game.js           # Entidad Partida y puntuación
│   │   └── validation.js     # Alias y estructura del banco
│   ├── data/
│   │   ├── questions.js      # Diez preguntas del tema acordado
│   │   └── supabase.js       # Cliente servidor de Supabase
│   └── server/
│       ├── game-service.js   # Casos de uso y orquestación
│       └── leaderboard-service.js
├── tests/
│   ├── unit/                 # node:test para lógica de dominio
│   └── manual/               # Registro P1–P7
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

Los endpoints concretos se ajustarán a la forma de funciones Node.js de Vercel elegida al implementar. La separación `domain` / `server` / `data` sigue aplicando aunque cambie el nombre del archivo de entrada.

## Entidades y contratos

- `Pregunta`: `id`, `prompt`, `options[4]`, `correctOptionIndex`, `position`. Método/regla para determinar si una opción es correcta.
- `Partida`: `id`, `alias`, estado de pregunta, respuestas confirmadas, `correctCount`, `score`, `status`, fecha de creación. Solo acepta una confirmación por pregunta; finaliza al contestar diez.
- Servicio de juego: inicia sesión de juego, valida cada respuesta, devuelve retroalimentación y resume al final.
- Repositorio de partidas: inserta finalizaciones de forma idempotente y consulta top cinco. Supabase queda detrás de esta interfaz para que la lógica de dominio no dependa del proveedor.

## Datos en Supabase

Tabla inicial sugerida `game_results`:

| Columna | Tipo sugerido | Regla |
|---|---|---|
| `id` | UUID | Clave primaria generada al insertar |
| `alias` | texto | No vacío, máximo 20 caracteres |
| `correct_count` | entero | 0–10 |
| `score` | entero | 0–100 y consistente con `correct_count * 10` |
| `created_at` | timestamp con zona horaria | Generado por la base de datos |
| `game_key` | UUID | Clave única para impedir doble inserción por reintento |

Consulta de clasificación: ordenar por `score DESC`, `created_at ASC` y un desempate estable por `id ASC`; limitar a cinco. El diseño de acceso (RLS/políticas) y claves se configura antes de conectar la aplicación. Nunca incluir una clave `service_role` en `public/`.

## Configuración

`.env.example` enumera solo nombres de variables, sin secretos. La configuración real va en variables de entorno locales ignoradas por Git y en los ajustes de Vercel. El nombre exacto de la variable de URL y las claves públicas/servidor se fijará al implementar el cliente Supabase.

## Manejo de errores

- Entrada inválida: respuesta de validación y mensaje accionable.
- Sin selección o respuesta repetida: no modificar estado ni puntaje.
- Supabase no disponible: informar que no se pudo guardar/consultar; nunca reportar éxito falso.
- Historial vacío: retornar lista vacía como resultado válido.
- Fallo de lectura/escritura: preservar datos y estado ya confirmado; registrar detalle técnico en logs del servidor sin exponer secretos.

## Decisiones pendientes

- Tema y nombre final de la trivia.
- Identificadores GitHub de integrantes para responsables formales.
- Diseño final de sesión de juego entre llamadas a funciones serverless (token firmado/estado persistido temporalmente u otra alternativa compatible con el alcance). No guardar en memoria de proceso porque Vercel puede ejecutar instancias independientes.
