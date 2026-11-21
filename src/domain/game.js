import { DomainError } from './errors.js';

export class Partida {
  constructor({ gameId, alias, questions, createdAt, currentPosition = 0, answers = [], status = 'IN_PROGRESS',
    expiresAt, lastQuestionId = null, lastOptionId = null, lastResponse = null }) {
    if (!Array.isArray(questions) || questions.length !== 10) {
      throw new DomainError('INVALID_QUESTION_SELECTION', 'La partida debe tener diez preguntas.', 500);
    }
    this.id = gameId;
    this.alias = alias;
    this.questions = questions;
    this.currentPosition = currentPosition;
    this.answers = answers;
    this.status = status;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt ?? new Date(Date.parse(createdAt) + 24 * 60 * 60 * 1000).toISOString();
    this.lastQuestionId = lastQuestionId;
    this.lastOptionId = lastOptionId;
    this.lastResponse = lastResponse;
  }

  get correctCount() {
    return this.answers.filter((answer) => answer.isCorrect).length;
  }

  get incorrectCount() {
    return this.answers.length - this.correctCount;
  }

  get score() {
    return this.correctCount * 10;
  }

  answer({ questionId, selectedOptionId, resultId, finishedAt }) {
    if (this.lastQuestionId === questionId) {
      if (this.lastOptionId === selectedOptionId) return { game: this, response: this.lastResponse, duplicate: true };
      throw new DomainError('QUESTION_ALREADY_ANSWERED', 'Esta pregunta ya fue confirmada con otra opción.', 409);
    }
    if (this.status !== 'IN_PROGRESS') {
      throw new DomainError('GAME_ALREADY_COMPLETED', 'La partida ya terminó.', 409);
    }
    const current = this.questions[this.currentPosition];
    if (!current) throw new DomainError('GAME_ALREADY_COMPLETED', 'La partida ya terminó.', 409);
    if (questionId !== current.id) {
      throw new DomainError('QUESTION_OUT_OF_ORDER', 'La pregunta no corresponde al avance actual.', 409);
    }
    if (!['A', 'B', 'C', 'D'].includes(selectedOptionId)) {
      throw new DomainError('INVALID_ANSWER', 'Selecciona una opción válida.', 400);
    }

    const isCorrect = current.isCorrect(selectedOptionId);
    const answers = [...this.answers, { questionId, selectedOptionId, isCorrect }];
    const currentPosition = this.currentPosition + 1;
    const completed = currentPosition === this.questions.length;
    const updated = new Partida({
      gameId: this.id,
      alias: this.alias,
      questions: this.questions,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      currentPosition,
      answers,
      status: completed ? 'COMPLETED' : 'IN_PROGRESS',
      lastQuestionId: questionId,
      lastOptionId: selectedOptionId,
    });
    const response = {
      gameId: this.id,
      status: updated.status,
      acceptedQuestionId: questionId,
      isCorrect,
      correctOptionId: current.correctOptionId,
      progress: { answered: currentPosition, total: this.questions.length },
      nextQuestion: completed ? null : this.questions[currentPosition].toPublic(currentPosition + 1),
    };
    if (completed) {
      response.result = {
        id: resultId,
        alias: this.alias,
        correctCount: updated.correctCount,
        incorrectCount: this.questions.length - updated.correctCount,
        score: updated.score,
        finishedAt,
      };
    }
    updated.lastResponse = response;
    return { game: updated, response, duplicate: false };
  }

  publicState() {
    if (this.status === 'COMPLETED') {
      return { gameId: this.id, status: 'COMPLETED', result: this.lastResponse?.result ?? null };
    }
    return {
      gameId: this.id,
      status: 'IN_PROGRESS',
      progress: { answered: this.currentPosition, total: this.questions.length },
      question: this.questions[this.currentPosition].toPublic(this.currentPosition + 1),
    };
  }
}

export function createGame(options) {
  return new Partida(options);
}

export function toPublicQuestion(question, position, total = 10) {
  return question.toPublic(position, total);
}

export function answerQuestion(game, _questions, answer) {
  return game.answer(answer);
}

export function toPublicGameState(game) {
  return game.publicState();
}
