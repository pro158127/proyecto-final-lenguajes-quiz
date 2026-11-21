# Roadmap del Reto Quiz

**Fecha de planificación:** 21 de noviembre de 2026. **Entrega:** 3 de diciembre de 2026.

## Equipo y responsabilidades

| Integrante | Enfoque principal | Responsabilidades |
|---|---|---|
| Jordan Amezquita (`@amezquitaJordan`) | Frontend Next.js | Inicio/alias, preguntas y avance, resultado, clasificación, teclado y ventana estrecha; integración con endpoints. |
| Cristian David Sánchez Mosquera (`@pro158127`) | Backend completado en PR #16 | Dominio, Route Handlers, contrato de API y pruebas unitarias. Continúa con soporte de integración cuando Supabase quede configurado. |
| Daniel Rueda (`@Danielrvasq`) | Supabase, pruebas y despliegue | Aplicar y verificar la migración, conectar persistencia/clasificación, liderar P1–P7 y configurar variables/despliegue en Vercel. |

El reparto es una asignación inicial. El equipo debe acordar revisiones cruzadas y registrar cada aporte real en los commits y README.

## Fases y fechas

| Fechas | Fase | Salida verificable |
|---|---|---|
| 21–22 nov. | Inicio y definición | Repositorio, tema elegido, banco fuente de 37 regionalismos, selección fija de diez y pantallas bosquejadas. |
| 23–24 nov. | Dominio y reglas | Alias, `Pregunta`, `Partida`, respuestas únicas y reglas de puntaje implementadas y probables en aislamiento. |
| 25–26 nov. | Recorrido jugable | Interfaz conectada al backend; se completa partida desde inicio hasta resumen. |
| 27–28 nov. | Persistencia y clasificación | Supabase conectado; partida final guardada una vez; historial y top cinco con desempate correctos. |
| 29 nov. | Primer despliegue | Versión accesible desde Vercel con configuración segura de variables. |
| 30 nov.–1 dic. | Verificación y corrección | U1–U3 y P1–P7 ejecutados; revisión de teclado, ancho estrecho y fallos de almacenamiento. |
| 2 dic. | Congelación y entrega | README, resultados de pruebas, ZIP limpio, prueba desde copia limpia y guion de sustentación. |
| 3 dic. | Entrega y sustentación | Revisión final y demo de 6–8 minutos con participación de los tres integrantes. |

## Backlog para GitHub Projects

El Project incluye campos de selección **Módulo** y **Fase** para filtrar las tareas por área y etapa. Las issues describen el responsable propuesto y los criterios de terminado; la asignación formal requiere usernames de GitHub.

| Tarea | Fase | Responsable propuesto | Criterio de terminado |
|---|---|---|---|
| Validar tema y selección fija de diez preguntas | Inicio | Todo el equipo | Banco fuente de 37 preguntas y selección fija de 10 IDs disponibles; todas las preguntas seleccionadas tienen cuatro opciones y respuesta correcta verificada. |
| Inicializar repositorio, README y reglas de colaboración | Inicio | Cristian + todo el equipo | Instrucciones, estructura y política de commits revisadas. |
| Diseñar flujo y vistas accesibles | Interfaz | Jordan | Cuatro rutas y estados definidos en `FRONTEND_INTERFACES.md`; llamadas API mapeadas por acción, campos etiquetados y flujo de teclado definido. |
| Implementar validación de alias y banco | Dominio | Cristian | Reglas RF-01/RF-03 cubiertas y errores claros. |
| Implementar entidad Pregunta | Dominio | Cristian | Opción se evalúa correctamente y estructura del banco queda validada. |
| Implementar entidad Partida y control de respuesta única | Dominio | Cristian | Estado inicia en cero, secuencia válida y pregunta no se puntúa dos veces. |
| Implementar cálculo y resumen final | Dominio | Cristian | Aciertos, errores y score derivan de respuestas; casos 0 y 100 correctos. |
| Aplicar y verificar el esquema Supabase de resultados y sesiones | Persistencia | Daniel | Esquema, validaciones, clave de idempotencia y acceso documentados. |
| Verificar repositorio Supabase de partidas | Persistencia | Daniel | Insertar una finalización y manejar errores sin ocultar fallo. |
| Verificar clasificación top cinco y desempates en Supabase | Persistencia | Daniel | Orden score desc, creación asc, límite cinco; lista vacía funciona. |
| Implementar Route Handlers Next.js | Integración | Cristian (terminado en PR #16) | Crear/recuperar partida, responder y consultar clasificación cumplen `CONTRATOS_API.md`. |
| Construir vistas frontend | Interfaz | Jordan | Rutas `/`, `/game/{gameId}`, `/result/{gameId}` y `/leaderboard` implementadas según `FRONTEND_INTERFACES.md`; teclado, ventana estrecha y estados completos. |
| Conectar frontend con endpoints | Integración | Jordan | Cada control llama la ruta especificada en `FRONTEND_INTERFACES.md`; feedback aparece antes de avanzar y el cliente no calcula puntaje. |
| Escribir pruebas unitarias U1–U3 | Pruebas | Cristian | Se ejecutan con Node.js sin navegador y cubren acierto, error y duplicado. |
| Registrar y liderar ejecución de P1–P7 | Pruebas | Daniel; Jordan apoya las verificaciones de interfaz | Cada escenario indica datos, resultado esperado y resultado observado. |
| Verificar fallos Supabase y preservación de historial | Pruebas | Daniel | Casos de lectura/escritura fallidos no muestran éxito ni borran datos. |
| Configurar variables y desplegar en Vercel | Despliegue | Daniel | Preview/producción disponible con secretos solo en entorno seguro. |
| Completar README y ZIP de entrega | Entrega | Todo el equipo; Jordan integra | Incluye integrantes/aportes, tema, setup, pruebas, datos, paradigma y ZIP sin dependencias. |
| Preparar demostración y explicación individual | Entrega | Todo el equipo | Demo cubre partida, dato inválido, persistencia, tests y una decisión por integrante. |

## Commits

Cada integrante hará **al menos siete commits útiles** durante el periodo (la guía exige seis; el equipo se propone superar ese mínimo). Distribuirlos en fechas distintas y describir el cambio. Ejemplos: `docs: define quiz requirements`, `feat: validate player alias`, `feat: persist completed game`, `test: cover repeated answer`, `fix: preserve leaderboard on read failure`.

No crear commits vacíos ni dividir artificialmente un mismo cambio para inflar el conteo. Usar autoría Git identificable y anotar pair programming en README cuando corresponda.

## Dependencias críticas

- Elegir el tema antes de llenar el banco definitivo.
- Usar y mantener `CONTRATOS_API.md` antes de conectar interfaz y Route Handlers.
- Definir política de acceso de Supabase antes de desplegar.
- Dar acceso de colaborador a Jordan y Daniel para permitir la asignación formal de issues en el repositorio privado.
