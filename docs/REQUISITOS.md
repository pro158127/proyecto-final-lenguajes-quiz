# Requisitos del Reto Quiz

## Propósito y alcance

La aplicación permite que una persona juegue una trivia individual de diez preguntas, obtenga un resultado y consulte las mejores partidas guardadas. El tema de las preguntas se confirmará por el equipo. No se incluyen cuentas, contraseñas, multijugador, pagos, inteligencia artificial ni editor de preguntas.

## Requisitos funcionales

| ID | Requisito detallado | Criterio verificable |
|---|---|---|
| RF-01 | Validar alias al iniciar. La aplicación recorta espacios al inicio y al final y conserva el alias normalizado. | Acepta de 2 a 20 caracteres tras recortar. Rechaza vacío, solo espacios y longitudes fuera del rango con mensaje que indique cómo corregirlo. |
| RF-02 | Iniciar una partida nueva con estado limpio, alias válido, contador de pregunta en cero y puntaje en cero. | Al iniciar o volver a jugar no quedan respuestas ni puntos de una partida previa. |
| RF-03 | Cargar el banco definido por el equipo, con diez preguntas identificables y ordenadas. Cada pregunta contiene enunciado, cuatro opciones y referencia a una única opción correcta. | El banco se valida al iniciar la aplicación o partida; cada pregunta tiene exactamente cuatro opciones y una respuesta correcta válida. |
| RF-04 | Presentar una pregunta a la vez y comunicar el avance. | Se muestran enunciado, cuatro opciones seleccionables y número actual de diez; no se muestran preguntas fuera de secuencia. |
| RF-05 | Requerir selección antes de confirmar una respuesta. | Sin opción seleccionada no avanza y se muestra indicación comprensible. |
| RF-06 | Evaluar y confirmar una respuesta una sola vez. | Al confirmar se bloquea la pregunta, se informa acierto/error y clics repetidos no cambian el resultado ni suman puntos. |
| RF-07 | Calcular el resultado desde las respuestas registradas de la partida. | Cada acierto suma 10; error suma 0; al final aciertos + errores = 10 y puntaje = aciertos × 10, entre 0 y 100. |
| RF-08 | Cerrar una partida solo después de contestar las diez preguntas y mostrar resumen. | Se muestran alias, aciertos, errores y puntaje final. Una partida incompleta no se guarda como terminada. |
| RF-09 | Persistir cada partida terminada una sola vez en Supabase. | Existe exactamente un registro por partida finalizada; reintentos técnicos no crean duplicados. Errores de persistencia se muestran sin anunciar éxito. |
| RF-10 | Recuperar historial guardado al solicitar la clasificación. | Tras recargar/reabrir la aplicación, partidas previamente confirmadas siguen disponibles. Si no hay historial, se muestra clasificación vacía sin error. |
| RF-11 | Mostrar clasificación ordenada y limitada. | Presenta hasta cinco resultados por puntaje descendente; ante empate aparece primero el registro anterior. Si hay menos de cinco, aparecen todos. Un alias puede repetirse. |
| RF-12 | Permitir jugar de nuevo con el alias actual o uno nuevo. | La nueva partida empieza en cero y no elimina ni modifica resultados previos. |

## Requisitos no funcionales

| ID | Requisito | Criterio verificable |
|---|---|---|
| RNF-01 | Respetar las tecnologías acordadas. | La aplicación usa Next.js sobre Node.js, Supabase para persistencia y Vercel para despliegue. No se incorpora otra base de datos ni otro framework sin acuerdo del equipo. |
| RNF-02 | Desplegar con el plan gratuito de Vercel. | La aplicación funciona en el entorno de Vercel sin depender de procesos persistentes; secretos y credenciales se configuran como variables de entorno, nunca se guardan en el repositorio. |
| RNF-03 | Separar responsabilidades y mantener módulos pequeños. | Interfaz, dominio/reglas y persistencia se organizan por separado; la lógica de puntuación puede probarse sin navegador ni Supabase. |
| RNF-04 | Usabilidad mínima. | Etiquetas y botones claros, texto legible, validación junto a la acción y navegación principal mediante teclado. La vista se comprueba también en ancho estrecho. |
| RNF-05 | Integridad y tolerancia a fallos. | Nunca se reemplaza el historial por una colección vacía tras un fallo; no se confirma guardado fallido; el orden y el puntaje provienen de datos estructurados. |
| RNF-06 | Pruebas ejecutables. | Hay al menos tres pruebas unitarias sin interfaz: acierto suma 10, error suma 0, respuesta repetida no duplica acierto. Se documentan y registran los siete escenarios manuales P1–P7. |
| RNF-07 | Trazabilidad del trabajo. | Cada integrante realiza al menos siete commits de avance real, con mensaje descriptivo y autoría identificable; el README explica aportes. |
| RNF-08 | Entrega reproducible. | Una persona puede instalar dependencias, configurar variables, ejecutar, probar y desplegar siguiendo el README. El ZIP final excluye dependencias reinstalables. |
| RNF-09 | Accesibilidad práctica. | Controles alcanzables con teclado, foco visible, etiquetas asociadas a campos y mensajes no basados únicamente en color. |

## Modelo de datos mínimo

**Pregunta**: `id`, `prompt`, `options` (cuatro opciones ordenadas), `correctOptionIndex` (0–3), `position`.

**Partida**: `id` (identificador único), `alias`, `correctCount`, `score`, `createdAt`. Se podrán derivar los errores como `10 - correctCount`. La marca de tiempo permite ordenar empates; si la base de datos retorna timestamps iguales, se usará un identificador/orden de creación estable como desempate secundario.

El cliente no debe poder alterar el puntaje enviado y guardado sin validación del servidor. La forma de validar y persistir se define en la implementación del backend; la clave privada de Supabase nunca se expone al navegador.

## Pruebas de aceptación manuales

| ID | Acción | Resultado esperado |
|---|---|---|
| P1 | Iniciar con alias vacío, espacios, uno y 21 caracteres; luego con longitud válida y espacios externos. | Rechazos claros para valores inválidos; normalización y comienzo para válido. |
| P2 | Intentar avanzar sin seleccionar; responder una pregunta correctamente y confirmar repetidamente. | No avanza sin selección; la pregunta queda bloqueada tras confirmar y suma una sola vez. |
| P3 | Finalizar con siete aciertos y tres errores. | Resumen 7/3/70 y un único registro persistido. |
| P4 | Jugar otra partida y responder todo mal. | Nueva partida comienza en cero, termina en 0 puntos y conserva el registro anterior. |
| P5 | Con historial preparado de 50, 90, 90, 20, 80 y 100. | Se muestran 100, 90, 90, 80 y 50; desempate por registro anterior. |
| P6 | Ejecutar con historial inicialmente vacío. | La aplicación abre; termina partida y guarda el primer registro. |
| P7 | Simular fallo de lectura o escritura en entorno de prueba. | Mensaje comprensible, sin falso éxito ni borrado del historial existente. |

## Pruebas unitarias obligatorias

- **U1**: respuesta correcta incrementa aciertos en uno y puntaje en 10.
- **U2**: respuesta incorrecta no incrementa aciertos ni puntaje.
- **U3**: confirmar dos veces la respuesta de la misma pregunta no duplica puntos.


## Organización por módulos

| Módulo | Requisitos funcionales | Requisitos no funcionales y evidencia |
|---|---|---|
| Definición y contenido | RF-03 | RNF-07/08; diez preguntas revisadas y versionadas. |
| Dominio del juego | RF-01, RF-02, RF-03, RF-05, RF-06, RF-07, RF-08, RF-12 | RNF-03/05/06; U1–U3 prueban reglas sin UI ni Supabase. |
| Interfaz Next.js | RF-01, RF-02, RF-04, RF-05, RF-06, RF-08, RF-11, RF-12 | RNF-04/09; teclado, foco, etiquetas, viewport estrecho y estados de carga/error. |
| API Next.js | RF-01 a RF-12 | RNF-03/05; validación de servidor, DTOs consistentes y errores HTTP documentados. |
| Datos Supabase | RF-05, RF-06, RF-09, RF-10, RF-11 | RNF-05; idempotencia, recuperación, orden estable, manejo de fallos y claves protegidas. |
| Pruebas y calidad | Validación transversal de RF-01 a RF-12 | RNF-06; U1–U3 automáticas y P1–P7 manuales con evidencia. |
| Despliegue y entrega | RF-01 a RF-12 disponibles en versión desplegada | RNF-02/08; Vercel, README, ZIP limpio y demo reproducible. |
| Gestión del equipo | No añade funciones de usuario | RNF-07 y rúbrica Git; más de seis commits útiles por integrante. |

Los contratos HTTP entre la interfaz, las rutas de Next.js y la persistencia están especificados en [CONTRATOS_API.md](CONTRATOS_API.md).
