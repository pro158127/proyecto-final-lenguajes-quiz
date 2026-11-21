export default function HomePage() {
  return (
    <main className="shell">
      <p className="eyebrow">Reto Quiz · Colombia</p>
      <h1>¿Qué tanto sabes de los regionalismos de Colombia?</h1>
      <p>Una trivia de diez preguntas para recorrer palabras y expresiones de distintas regiones.</p>
      <p className="note">La interfaz del juego está en desarrollo. El contrato de la API y las reglas del backend ya están definidos.</p>
      <a href="/api/leaderboard">Consultar la API de clasificación</a>
    </main>
  );
}
