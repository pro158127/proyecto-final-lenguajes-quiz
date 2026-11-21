import { getLeaderboard } from '../../../src/server/leaderboard/leaderboard-service.js';
import { errorResponse, json } from '../../../src/server/http.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const rawLimit = new URL(request.url).searchParams.get('limit');
    const limit = rawLimit === null ? 5 : Number(rawLimit);
    return json(await getLeaderboard(limit));
  } catch (error) {
    return errorResponse(error);
  }
}
