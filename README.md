# Reto Quiz

Aplicación web de trivia para el proyecto final de Lenguajes de Programación. La solución usará Next.js sobre Node.js y Supabase; se desplegará en Vercel dentro del plan gratuito.

## Estado

Este repositorio contiene la definición de requisitos, la arquitectura propuesta y el roadmap inicial. La temática es regionalismos de Colombia. El banco contiene 37 preguntas fuente y la partida básica usa diez preguntas fijas de distintas regiones. El nombre del tercer integrante sigue pendiente de confirmación.

## Documentación

- [Banco fuente de regionalismos](src/data/regionalismos_colombia.json)
- [Selección fija para la partida](src/data/seleccion_partida.json)
- [Requisitos funcionales y no funcionales](docs/REQUISITOS.md)
- [Arquitectura del programa](docs/ARQUITECTURA.md)
- [Contratos entre módulos y API](docs/CONTRATOS_API.md)
- [Roadmap y reparto](docs/ROADMAP.md)

## Tecnologías acordadas

- Next.js sobre Node.js para interfaz y rutas de API; pruebas con el ejecutor integrado de Node.js.
- Supabase para persistencia de sesiones y resultados.
- Vercel para despliegue gratuito.
- Interfaz web con HTML, CSS y JavaScript del navegador, servida desde el proyecto Node.js.

## Equipo

- Jordan Amezquita (`@amezquitaJordan`): frontend.
- Cristian David Sánchez Mosquera (`@pro158127`): backend y pruebas.
- Daniel Rueda (`@Danielrvasq`): backend y pruebas.

La asignación formal de Jordan y Daniel a las issues requiere que tengan acceso de colaborador al repositorio privado.
