# Contexto del proyecto para asistentes de IA

> Documento de continuidad para cualquier IA que ayude al equipo. Leer antes de proponer cambios o volver a implementar algo. Actualizar este archivo cuando cambie el estado del proyecto.

## Proyecto y objetivo

Reto Quiz es una trivia individual de regionalismos colombianos. El jugador escribe un alias, responde diez preguntas de opción múltiple, consulta su resultado y puede ver las cinco mejores partidas.

- **Repositorio:** `pro158127/proyecto-final-lenguajes-quiz`
- **Rama principal:** `main`
- **Stack acordado:** Next.js sobre Node.js, Supabase y despliegue en Vercel. No incorporar otro framework o proveedor de base de datos sin acuerdo del equipo.
- **Entrega planificada:** 3 de diciembre de 2026.
- **Tema y banco:** regionalismos colombianos; el banco del proyecto está en `src/` y provino del archivo compartido por el equipo.

## Estado integrado

El PR [#16](https://github.com/pro158127/proyecto-final-lenguajes-quiz/pull/16) se fusionó a `main` el 21 de noviembre de 2026. En la última revisión, `main` estaba sincronizada con `origin/main` y no había otros PR abiertos. El merge cerró los issues vinculados al trabajo integrado.

El PR integró:

- Requisitos, arquitectura, roadmap y responsabilidades iniciales.
- Banco de regionalismos y lógica de preguntas/partidas.
- Route Handlers de Next.js para crear/recuperar partidas, enviar respuestas y consultar clasificación.
- Integración de persistencia con Supabase en el código y una migración SQL.
- Contratos HTTP y ejemplos de requests/responses para conectar el frontend.
- Documentación de pantallas, llamadas API, configuración y coordinación frontend/backend.

En la revisión posterior al merge, **14 pruebas pasaron y `npm run build` terminó correctamente**. La integración de código y las comprobaciones locales no significan que la base Supabase real o el despliegue de Vercel ya estén configurados.

Documentos base que deben consultarse:

- `docs/REQUISITOS.md`: requisitos funcionales y no funcionales.
- `docs/ARQUITECTURA.md`: organización y responsabilidades técnicas.
- `docs/CONTRATOS_API.md`: rutas, esquemas, respuestas y errores HTTP.
- `docs/FRONTEND_INTERFACES.md`: pantallas, estados y mapeo interfaz/API.
- `docs/ROADMAP.md`: fases, issues y entregables.

## Responsables y trabajo que falta

### Jordan Amezquita — `@amezquitaJordan` — frontend

Pendiente:

- Reemplazar la portada provisional por las pantallas descritas en `docs/FRONTEND_INTERFACES.md`: inicio, partida, resultado y clasificación.
- Implementar estados de carga, validación, feedback, finalización, error y clasificación vacía.
- Conectar los controles mediante `fetch` a los endpoints documentados. El cliente no calcula puntajes ni decide la respuesta correcta.
- Cubrir navegación por teclado, foco visible y vista estrecha.
- Integrar y corregir el frontend frente a la API existente; apoyar las pruebas manuales que requieran interfaz.

### Daniel Rueda — `@Danielrvasq` — Supabase, pruebas de aceptación y despliegue

Pendiente:

- Aplicar `supabase/migrations/20261121000000_quiz_schema.sql` a la instancia Supabase del equipo.
- Configurar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` de forma segura en local/Vercel; nunca exponer la service role key al navegador ni usar prefijo `NEXT_PUBLIC_`.
- Verificar contra Supabase real la creación/avance de partida, guardado final idempotente, lectura de historial y top cinco con sus desempates.
- Ejecutar y documentar los escenarios manuales P1–P7, incluyendo fallos de lectura/escritura y persistencia.
- Enlazar el proyecto con Vercel, definir variables de entorno y comprobar un despliegue accesible.
- Registrar resultados y evidencia en la documentación de entrega.

### Cristian David Sánchez Mosquera — `@pro158127` — backend/API

La implementación inicial de dominio, Route Handlers, contratos y pruebas unitarias quedó integrada mediante el PR #16.

Pendiente / apoyo:

- Apoyar a Jordan y Daniel resolviendo defectos o desajustes reproducibles entre interfaz, API y Supabase.
- Revisar cambios de integración del backend y mantener `docs/CONTRATOS_API.md` sincronizado si se modifica el contrato.
- Confirmar que las pruebas unitarias continúan pasando al integrar cambios.
- No duplicar los módulos ya integrados sin una necesidad identificada.

### Todo el equipo

- Hacer commits útiles y atribuibles a quien realizó el trabajo; no crear commits vacíos o artificiales para cumplir una cifra.
- Revisar cambios e integrar PRs a `main` con CI satisfactorio.
- Completar README de entrega, ZIP limpio, guion/demo y explicación de aportes individuales.
- El roadmap propone al menos siete commits útiles por persona durante el proyecto; revisar el requisito exacto del profesor en el documento fuente si se requiere certificarlo.

## Contrato rápido para el frontend

Estas son las rutas implementadas/documentadas; para los cuerpos completos, respuestas y errores, prevalece `docs/CONTRATOS_API.md`.

| Acción | Llamada | Solicitud |
|---|---|---|
| Crear o reiniciar partida | `POST /api/games` | `{ "alias": "Luna" }` |
| Recuperar partida | `GET /api/games/{gameId}` | Sin body |
| Enviar respuesta | `POST /api/games/{gameId}/answers` | `{ "questionId": "q-01", "selectedOptionId": "C" }` |
| Consultar top cinco | `GET /api/leaderboard?limit=5` | Sin body |

El servidor es la fuente de verdad para validación, orden, evaluación, puntaje y persistencia. Ante error, el cliente debe mostrar el error y no simular éxito ni convertir un fallo de ranking en una lista vacía.

## Bloqueos de configuración conocidos

En la última revisión no se contaba con las credenciales de la instancia Supabase ni con el enlace/configuración del proyecto Vercel. Por eso aún faltan la aplicación real de la migración, la verificación de persistencia remota y el despliegue. El equipo debe cargar esos secretos directamente en los entornos autorizados; no pegarlos en commits, issues ni este documento.

El repositorio es privado y en la revisión de permisos solo se reconocía `pro158127` como colaborador. Los campos del GitHub Project y el texto de issues documentan a Jordan y Daniel como responsables propuestos, pero para asignarles issues formalmente deben tener acceso al repositorio.

## Guía para la siguiente IA

1. Comprueba `git status`, rama actual y estado remoto antes de editar.
2. Lee este documento y los documentos técnicos relacionados con la tarea.
3. Comprueba issues/PR actuales en GitHub antes de crear duplicados; el estado puede haber cambiado desde la fecha indicada.
4. Trabaja en la tarea pendiente del responsable correspondiente y conserva los contratos existentes salvo que haya evidencia de que requieren cambio.
5. No afirmes que Supabase/Vercel están listos sin verificar la instancia y el despliegue reales.
6. Ejecuta verificaciones solo si el equipo las solicita o si son parte explícita de la tarea activa; documenta exactamente qué se ejecutó y su resultado.
7. Al terminar, actualiza el estado de este archivo y resume archivos, cambios, validaciones y bloqueos.
