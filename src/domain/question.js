export class Question {
  constructor(source, position = source.id) {
    this.sourceId = source.id;
    this.id = `q-${String(position).padStart(2, '0')}`;
    this.position = position;
    this.region = source.region;
    this.term = source.palabra;
    this.prompt = source.pregunta;
    this.options = ['A', 'B', 'C', 'D'].map((id) => ({ id, label: source.opciones[id] }));
    this.correctOptionId = source.respuesta_correcta;
    this.explanation = source.explicacion;
  }

  isCorrect(optionId) {
    return optionId === this.correctOptionId;
  }

  toPublic(position, total = 10) {
    return {
      id: this.id,
      position,
      total,
      prompt: this.prompt,
      options: this.options.map(({ id, label }) => ({ id, label })),
    };
  }
}
