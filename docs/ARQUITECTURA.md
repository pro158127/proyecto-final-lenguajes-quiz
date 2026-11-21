# Arquitectura del programa

## Decisión general

Aplicación web pequeña con Next.js sobre Node.js. Next.js sirve las páginas y expone Route Handlers HTTP como backend; Supabase proporciona la persistencia. Vercel despliega el proyecto. El tema y el banco son contenido versionado; no se necesita editor de preguntas.

## Flujo principal

1. La interfaz solicita alias y realiza validación amigable.
2. El navegador pide comenzar una partida al backend Node.js.
3. La lógica de dominio valida el alias, carga preguntas y crea un estado de partida.
4. En cada respuesta, el backend valida selección y secuencia, registra el resultado temporal de la pregunta y evita una segunda confirmación.
5. Al completar diez, el backend calcula resumen y persiste una sola partida en Supabase.
6. La clasificación solicita al backend los cinco mejores registros, ordenados por puntaje y fecha de creación.

El backend valida y calcula el puntaje; no confía en un total calculado solo por el navegador. Las credenciales privilegiadas de Supabase permanecen del lado servidor.

## Estructura propuesta

```text
.
├── app/
│   ├── page.tsx                         # Inicio y flujo de trivia
│   ├── leaderboard/page.tsx             # Clasificación
│   └── api/
│       ├── games/route.ts               # POST crear partida
│       ├── games/[gameId]/route.ts      # GET estado de partida
│       ├── games/[gameId]/answers/route.ts # POST confirmar respuesta
│       └── leaderboard/route.ts         # GET top cinco
├── components/                          # Componentes de interfaz
├── docs/                                # Requisitos, arquitectura y contratos
├── public/                              # Recursos estáticos propios
├── src/
│   ├── client/api-client.ts             # Consumo tipado de la API desde UI
│   ├── domain/                          # Pregunta, Partida y reglas puras
│   ├── server/games/                    # Casos de uso de partida
│   ├── server/leaderboard/              # Caso de uso de clasificación
│   └── server/repositories/             # Interfaces e implementación Supabase
├── tests/unit/                          # Pruebas puras del dominio
├── tests/api/                           # Pruebas de contratos de rutas
├── tests/manual/                        # Registro P1–P7
├── .env.example
├── package.json
└── README.md
```

Los Route Handlers usan runtime Node.js. Las páginas/componentes llaman al cliente API; solo el código `src/server` usa credenciales de Supabase. Evitar importar módulos `server` desde componentes de navegador.

## Módulos del proyecto

| Módulo | Responsabilidad | Requisitos asociados | Evidencia principal |
|---|---|---|---|
| Definición y requisitos | Tema, diez preguntas, estructura y plan | RF-03; RNF-07/08 | Banco y documentación revisados |
| Dominio del juego | Alias, Pregunta, Partida, secuencia, puntaje y finalización | RF-01 a RF-04, RF-07/08; U1–U3 | Reglas ejecutables aisladas de interfaz y base de datos |
| Interfaz Next.js | Inicio, juego, progreso, feedback, resultado, replay | RF-01 a RF-04, RF-07/08, RF-12; RNF-04/09 | Flujo usable con teclado y ventana estrecha |
| API Next.js | Validación HTTP y contratos JSON entre UI y lógica | RF-01 a RF-12; RNF-03/05 | Route Handlers según `CONTRATOS_API.md` |
| Datos Supabase | Sesiones temporales y resultados finales; clasificación | RF-05/06; RNF-05 | Persistencia única, recuperación y orden estable |
| Pruebas y calidad | Unitarias, API y escenarios manuales | RNF-06; P1–P7 | U1–U3 y P1–P7 documentadas |
| Despliegue y entrega | Variables seguras, Vercel, README, ZIP y sustentación | RNF-02/08/entrega | Copia limpia y demo reproducible |
| Gestión del equipo | Aportes, revisión y commits | RNF-07 y rúbrica de control de versiones | Más de seis commits útiles por persona |

## Entidades y contratos

- `Pregunta`: `id`, `prompt`, `options[4]`, `correctOptionIndex`, `position`. Método/regla para determinar si una opción es correcta.
- `Partida`: `id`, `alias`, estado de pregunta, respuestas confirmadas, `correctCount`, `score`, `status`, fecha de creación. Solo acepta una confirmación por pregunta; finaliza al contestar diez.
- Servicio de juego: inicia sesión de juego, valida cada respuesta, devuelve retroalimentación y resume al final.
- Repositorio de partidas: inserta finalizaciones de forma idempotente y consulta top cinco. Supabase queda detrás de esta interfaz para que la lógica de dominio no dependa del proveedor.

## Datos en Supabase

Tablas sugeridas `game_sessions` y `game_results`. `game_sessions` conserva el progreso temporal necesario entre llamadas serverless; no es historial de partidas terminadas ni aparece en la clasificación. Las sesiones incompletas pueden expirar y eliminarse.

`game_results`:

| Columna | Tipo sugerido | Regla |
|---|---|---|
| `id` | UUID | Clave primaria generada al insertar |
| `sequence` | entero generado por la base de datos | Consecutivo de registro; resuelve empates por orden de inserción |
| `alias` | texto | No vacío, máximo 20 caracteres |
| `correct_count` | entero | 0–10 |
| `score` | entero | 0–100 y consistente con `correct_count * 10` |
| `created_at` | timestamp con zona horaria | Generado por la base de datos |
| `game_id` | UUID | Clave única de la sesión de juego para impedir doble inserción por reintento |

Consulta de clasificación: ordenar por `score DESC`, luego por `sequence ASC` (consecutivo generado al insertar) y limitar a cinco. Esto conserva exactamente el orden de registro incluso si dos marcas de tiempo coinciden. El diseño de acceso (RLS/políticas) y claves se configura antes de conectar la aplicación. Nunca incluir una clave `service_role` en `public/`.

## Configuración

`.env.example` enumera solo nombres de variables, sin secretos. La configuración real va en variables de entorno locales ignoradas por Git y en los ajustes de Vercel. El nombre exacto de la variable de URL y las claves públicas/servidor se fija al implementar el cliente Supabase. El proyecto requiere Node.js 20.9 o superior para la versión actual de Next.js elegida.

## Manejo de errores

- Entrada inválida: respuesta de validación y mensaje accionable.
- Sin selección o respuesta repetida: no modificar estado ni puntaje.
- Supabase no disponible: informar que no se pudo guardar/consultar; nunca reportar éxito falso.
- Historial vacío: retornar lista vacía como resultado válido.
- Fallo de lectura/escritura: preservar datos y estado ya confirmado; registrar detalle técnico en logs del servidor sin exponer secretos.

## Decisiones pendientes

- Tema y nombre final de la trivia.
- Identificadores GitHub de integrantes para responsables formales.
- Confirmar la expiración y política de limpieza de sesiones incompletas. La propuesta es guardar progreso temporal en Supabase; la partida incompleta no se inserta en `game_results` ni en el ranking.
