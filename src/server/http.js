import { DomainError } from '../domain/errors.js';
import { Partida } from '../domain/game.js';

export function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function errorResponse(error) {
  if (error instanceof DomainError) {
    return json({ error: { code: error.code, message: error.message } }, error.status);
  }
  const message = String(error?.message ?? '');
  const code = message.includes('GAME_NOT_FOUND') ? 'GAME_NOT_FOUND'
    : message.includes('GAME_EXPIRED') ? 'GAME_EXPIRED'
    : message.includes('QUESTION_ALREADY_ANSWERED') ? 'QUESTION_ALREADY_ANSWERED'
    : message.includes('QUESTION_OUT_OF_ORDER') ? 'QUESTION_OUT_OF_ORDER'
    : message.includes('GAME_ALREADY_COMPLETED') ? 'GAME_ALREADY_COMPLETED'
    : 'STORAGE_UNAVAILABLE';
  const status = code === 'GAME_NOT_FOUND' ? 404 : code === 'GAME_EXPIRED' ? 410
    : ['QUESTION_ALREADY_ANSWERED', 'QUESTION_OUT_OF_ORDER', 'GAME_ALREADY_COMPLETED'].includes(code) ? 409 : 503;
  if (status === 503) console.error('API storage/configuration error:', error);
  const messageForClient = status === 503 ? 'No fue posible acceder a los datos. Intenta de nuevo.'
    : code === 'GAME_NOT_FOUND' ? 'No se encontró la partida.'
    : code === 'GAME_EXPIRED' ? 'La partida expiró. Inicia una nueva.'
    : code === 'QUESTION_ALREADY_ANSWERED' ? 'La pregunta ya fue respondida.'
    : code === 'QUESTION_OUT_OF_ORDER' ? 'La pregunta no corresponde al avance actual.'
    : 'La partida ya terminó.';
  return json({ error: { code, message: messageForClient } }, status);
}

export async function readJson(request) {
  let body;
  try { body = await request.json(); }
  catch { throw new DomainError('INVALID_REQUEST', 'El cuerpo debe ser JSON válido.', 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new DomainError('INVALID_REQUEST', 'El cuerpo debe ser un objeto JSON.', 400);
  }
  return body;
}

export function gameFromRow(row, questions) {
  return new Partida({
    gameId: row.id,
    alias: row.alias,
    questions,
    currentPosition: row.current_position,
    answers: row.answers,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastQuestionId: row.last_question_id,
    lastOptionId: row.last_option_id,
    lastResponse: row.last_response,
  });
}
