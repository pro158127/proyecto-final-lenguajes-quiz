import { submitGameAnswer } from '../../../../../src/server/games/game-service.js';
import { errorResponse, json, readJson } from '../../../../../src/server/http.js';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const { gameId } = await params;
    const body = await readJson(request);
    return json(await submitGameAnswer(gameId, body));
  } catch (error) {
    return errorResponse(error);
  }
}
