import { startGame } from '../../../src/server/games/game-service.js';
import { errorResponse, json, readJson } from '../../../src/server/http.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { alias } = await readJson(request);
    return json(await startGame(alias), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
