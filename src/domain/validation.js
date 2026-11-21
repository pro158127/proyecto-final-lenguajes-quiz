import { DomainError } from './errors.js';

export function normalizeAlias(value) {
  if (typeof value !== 'string') {
    throw new DomainError('INVALID_ALIAS', 'Escribe un alias de 2 a 20 caracteres.');
  }
  const alias = value.trim();
  if (alias.length < 2 || alias.length > 20) {
    throw new DomainError('INVALID_ALIAS', 'Escribe un alias de 2 a 20 caracteres.');
  }
  return alias;
}

export function validateSourceBank(bank) {
  if (!bank || !Array.isArray(bank.preguntas) || bank.preguntas.length < 10) {
    throw new DomainError('INVALID_QUESTION_BANK', 'El banco debe tener al menos diez preguntas.', 500);
  }
  const ids = new Set();
  for (const question of bank.preguntas) {
    const optionKeys = question?.opciones && Object.keys(question.opciones).sort();
    if (!Number.isInteger(question?.id) || ids.has(question.id) ||
        !question.pregunta || !question.region ||
        JSON.stringify(optionKeys) !== JSON.stringify(['A', 'B', 'C', 'D']) ||
        !Object.hasOwn(question.opciones, question.respuesta_correcta)) {
      throw new DomainError('INVALID_QUESTION_BANK', `La pregunta ${question?.id ?? 'sin ID'} no es válida.`, 500);
    }
    ids.add(question.id);
  }
  return true;
}

export function selectGameQuestions(bank, selection) {
  validateSourceBank(bank);
  const ids = selection?.question_ids;
  if (!Array.isArray(ids) || ids.length !== 10 || new Set(ids).size !== 10) {
    throw new DomainError('INVALID_QUESTION_SELECTION', 'La selección de partida debe contener diez IDs únicos.', 500);
  }
  const byId = new Map(bank.preguntas.map((question) => [question.id, question]));
  const questions = ids.map((id) => byId.get(id));
  if (questions.some((question) => !question)) {
    throw new DomainError('INVALID_QUESTION_SELECTION', 'La selección contiene IDs que no existen en el banco.', 500);
  }
  return questions;
}
