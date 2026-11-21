import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as createGame } from '../../app/api/games/route.js';
import { GET as getLeaderboard } from '../../app/api/leaderboard/route.js';

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
