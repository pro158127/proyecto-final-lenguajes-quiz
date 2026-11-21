import { randomUUID } from 'node:crypto';
import { answerQuestion, createGame, toPublicQuestion } from '../../domain/game.js';
import { DomainError } from '../../domain/errors.js';
import { normalizeAlias } from '../../domain/validation.js';
import { applyGameAnswer, findGameResult, findGameSession, insertGameSession } from '../repositories/game-repository.js';
import { gameQuestions } from '../question-data.js';
import { gameFromRow } from '../http.js';

const GAME_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateGameId(gameId) {
  if (typeof gameId !== 'string' || !GAME_ID_PATTERN.test(gameId)) {
    throw new DomainError('INVALID_REQUEST', 'El identificador de partida no tiene un formato válido.', 400);
  }
}

export async function startGame(rawAlias) {
  const alias = normalizeAlias(rawAlias);
  const now = new Date().toISOString();
  const game = createGame({ gameId: randomUUID(), alias, questions: gameQuestions, createdAt: now });
  await insertGameSession(game);
  return {
    gameId: game.id,
    status: game.status,
    progress: { answered: 0, total: gameQuestions.length },
    question: toPublicQuestion(gameQuestions[0], 1, gameQuestions.length),
  };
}

export async function getGameState(gameId) {
  validateGameId(gameId);
  const row = await findGameSession(gameId);
  if (!row) throw new DomainError('GAME_NOT_FOUND', 'No se encontró la partida.', 404);
  if (row.status === 'IN_PROGRESS' && Date.parse(row.expires_at) <= Date.now()) {
    throw new DomainError('GAME_EXPIRED', 'La partida expiró. Inicia una nueva.', 410);
  }
  const game = gameFromRow(row, gameQuestions);
  if (game.status === 'COMPLETED') {
    return { gameId: game.id, status: 'COMPLETED', result: await findGameResult(game.id) };
  }
  return game.publicState();
}

export async function submitGameAnswer(gameId, { questionId, selectedOptionId }) {
  if (typeof questionId !== 'string' || !/^q-(0[1-9]|10)$/.test(questionId) ||
      !['A', 'B', 'C', 'D'].includes(selectedOptionId)) {
    throw new DomainError('INVALID_ANSWER', 'Envía una pregunta y una opción válidas.', 400);
  }
  validateGameId(gameId);
  const row = await findGameSession(gameId);
  if (!row) throw new DomainError('GAME_NOT_FOUND', 'No se encontró la partida.', 404);
  if (row.status === 'IN_PROGRESS' && Date.parse(row.expires_at) <= Date.now()) {
    throw new DomainError('GAME_EXPIRED', 'La partida expiró. Inicia una nueva.', 410);
  }
  const game = gameFromRow(row, gameQuestions);
  const resultId = game.currentPosition === gameQuestions.length - 1 ? randomUUID() : undefined;
  const outcome = answerQuestion(game, gameQuestions, {
    questionId,
    selectedOptionId,
    resultId,
    finishedAt: new Date().toISOString(),
  });
  if (outcome.duplicate) return outcome.response;
  return applyGameAnswer({
    game: outcome.game,
    expectedPosition: game.currentPosition,
    questionId,
    optionId: selectedOptionId,
    result: outcome.response.result ?? null,
  });
}
