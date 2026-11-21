import { getGameState } from '../../../../src/server/games/game-service.js';
import { errorResponse, json } from '../../../../src/server/http.js';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    const { gameId } = await params;
    return json(await getGameState(gameId));
  } catch (error) {
    return errorResponse(error);
  }
}
