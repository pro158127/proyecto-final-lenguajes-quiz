# Roadmap del Reto Quiz

**Fecha de planificación:** 21 de noviembre de 2026. **Entrega:** 3 de diciembre de 2026.

## Equipo y responsabilidades

| Integrante | Enfoque principal | Responsabilidades |
|---|---|---|
| Jordan Amesqueta | Frontend | Inicio/alias, preguntas y avance, resultado, clasificación, teclado y ventana estrecha; integración con endpoints. |
| Cristian David Sánchez Mosquera | Backend y pruebas | Modelo y reglas de partida, validación de respuestas, cálculo de puntaje, endpoints y pruebas unitarias. |
| Tercer integrante (nombre pendiente) | Backend y pruebas | Esquema y persistencia Supabase, clasificación/desempate, pruebas de integración/manuales, README y despliegue junto al equipo. |

El reparto es una asignación inicial. El equipo debe acordar revisiones cruzadas y registrar cada aporte real en los commits y README.

## Fases y fechas

| Fechas | Fase | Salida verificable |
|---|---|---|
| 21–22 nov. | Inicio y definición | Repositorio, tema elegido, diez preguntas, arquitectura revisada y pantallas bosquejadas. |
| 23–24 nov. | Dominio y reglas | Alias, `Pregunta`, `Partida`, respuestas únicas y reglas de puntaje implementadas y probables en aislamiento. |
| 25–26 nov. | Recorrido jugable | Interfaz conectada al backend; se completa partida desde inicio hasta resumen. |
| 27–28 nov. | Persistencia y clasificación | Supabase conectado; partida final guardada una vez; historial y top cinco con desempate correctos. |
| 29 nov. | Primer despliegue | Versión accesible desde Vercel con configuración segura de variables. |
| 30 nov.–1 dic. | Verificación y corrección | U1–U3 y P1–P7 ejecutados; revisión de teclado, ancho estrecho y fallos de almacenamiento. |
| 2 dic. | Congelación y entrega | README, resultados de pruebas, ZIP limpio, prueba desde copia limpia y guion de sustentación. |
| 3 dic. | Entrega y sustentación | Revisión final y demo de 6–8 minutos con participación de los tres integrantes. |

## Backlog para GitHub Projects

| Tarea | Fase | Responsable propuesto | Criterio de terminado |
|---|---|---|---|
| Elegir tema y preparar diez preguntas válidas | Inicio | Todo el equipo | Banco con 10 preguntas, cuatro opciones cada una, respuesta correcta revisada por otra persona. |
| Inicializar repositorio, README y reglas de colaboración | Inicio | Cristian + todo el equipo | Instrucciones, estructura y política de commits revisadas. |
| Diseñar flujo y vistas accesibles | Interfaz | Jordan | Inicio, juego, resumen y clasificación bosquejados; campos etiquetados y flujo de teclado definido. |
| Implementar validación de alias y banco | Dominio | Cristian | Reglas RF-01/RF-03 cubiertas y errores claros. |
| Implementar entidad Pregunta | Dominio | Cristian | Opción se evalúa correctamente y estructura del banco queda validada. |
| Implementar entidad Partida y control de respuesta única | Dominio | Cristian | Estado inicia en cero, secuencia válida y pregunta no se puntúa dos veces. |
| Implementar cálculo y resumen final | Dominio | Cristian | Aciertos, errores y score derivan de respuestas; casos 0 y 100 correctos. |
| Crear tabla y restricciones de resultados en Supabase | Persistencia | Tercer integrante | Esquema, validaciones, clave de idempotencia y acceso documentados. |
| Implementar repositorio Supabase de partidas | Persistencia | Tercer integrante | Insertar una finalización y manejar errores sin ocultar fallo. |
| Implementar consulta de top cinco | Persistencia | Tercer integrante | Orden score desc, creación asc, límite cinco; lista vacía funciona. |
| Implementar endpoints Node.js | Integración | Cristian + tercer integrante | Inicio/respuesta/resumen/clasificación validan entradas y responden contratos acordados. |
| Construir vistas frontend | Interfaz | Jordan | Flujo completo, responsive estrecho, estados de carga/error y teclado básico. |
| Conectar frontend con endpoints | Integración | Jordan + Cristian | Partida end-to-end sin lógica de puntaje confiada al cliente. |
| Escribir pruebas unitarias U1–U3 | Pruebas | Cristian | Se ejecutan con Node.js sin navegador y cubren acierto, error y duplicado. |
| Registrar ejecución de P1–P7 | Pruebas | Tercer integrante + Jordan | Cada escenario indica datos, resultado esperado y resultado observado. |
| Verificar fallos Supabase y preservación de historial | Pruebas | Tercer integrante | Casos de lectura/escritura fallidos no muestran éxito ni borran datos. |
| Configurar variables y desplegar en Vercel | Despliegue | Cristian + tercer integrante | Preview/producción disponible con secretos solo en entorno seguro. |
| Completar README y ZIP de entrega | Entrega | Todo el equipo; Jordan integra | Incluye integrantes/aportes, tema, setup, pruebas, datos, paradigma y ZIP sin dependencias. |
| Preparar demostración y explicación individual | Entrega | Todo el equipo | Demo cubre partida, dato inválido, persistencia, tests y una decisión por integrante. |

## Commits

Cada integrante hará **al menos siete commits útiles** durante el periodo (la guía exige seis; el equipo se propone superar ese mínimo). Distribuirlos en fechas distintas y describir el cambio. Ejemplos: `docs: define quiz requirements`, `feat: validate player alias`, `feat: persist completed game`, `test: cover repeated answer`, `fix: preserve leaderboard on read failure`.

No crear commits vacíos ni dividir artificialmente un mismo cambio para inflar el conteo. Usar autoría Git identificable y anotar pair programming en README cuando corresponda.

## Dependencias críticas

- Elegir el tema antes de llenar el banco definitivo.
- Acordar el contrato de endpoints antes de conectar frontend y backend.
- Definir política de acceso de Supabase antes de desplegar.
- Resolver la identidad GitHub de los tres integrantes para asignar tareas formalmente.
