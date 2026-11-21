import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as createGame } from '../../app/api/games/route.js';
import { GET as getLeaderboard } from '../../app/api/leaderboard/route.js';
import { GET as getGame } from '../../app/api/games/[gameId]/route.js';
import { POST as submitAnswer } from '../../app/api/games/[gameId]/answers/route.js';

test('POST /api/games rechaza un alias inválido sin intentar guardar', async () => {
  const request = new Request('http://localhost/api/games', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ alias: '  ' }),
  });
  const response = await createGame(request);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: { code: 'INVALID_ALIAS', message: 'Escribe un alias de 2 a 20 caracteres.' },
  });
});

test('GET /api/leaderboard rechaza un límite superior a cinco', async () => {
  const response = await getLeaderboard(new Request('http://localhost/api/leaderboard?limit=6'));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: { code: 'INVALID_LIMIT', message: 'El límite debe estar entre 1 y 5.' },
  });
});

test('GET /api/games/{gameId} rechaza un ID que no sea UUID', async () => {
  const response = await getGame(new Request('http://localhost/api/games/bad-id'), { params: Promise.resolve({ gameId: 'bad-id' }) });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: { code: 'INVALID_REQUEST', message: 'El identificador de partida no tiene un formato válido.' },
  });
});

test('POST /api/games/{gameId}/answers rechaza una opción fuera de A–D antes de acceder a Supabase', async () => {
  const request = new Request('http://localhost/api/games/123e4567-e89b-42d3-a456-426614174000/answers', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ questionId: 'q-01', selectedOptionId: 'X' }),
  });
  const response = await submitAnswer(request, { params: Promise.resolve({ gameId: '123e4567-e89b-42d3-a456-426614174000' }) });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: { code: 'INVALID_ANSWER', message: 'Envía una pregunta y una opción válidas.' },
  });
});
