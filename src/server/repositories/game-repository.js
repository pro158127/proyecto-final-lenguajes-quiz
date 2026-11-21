import { getSupabase } from '../supabase.js';

export async function insertGameSession(game) {
  const { error } = await getSupabase().from('game_sessions').insert({
    id: game.id,
    alias: game.alias,
    current_position: game.currentPosition,
    answers: game.answers,
    status: game.status,
    last_question_id: game.lastQuestionId,
    last_option_id: game.lastOptionId,
    last_response: game.lastResponse,
    created_at: game.createdAt,
    expires_at: game.expiresAt,
  });
  if (error) throw error;
}

export async function findGameSession(gameId) {
  const { data, error } = await getSupabase().from('game_sessions').select('*').eq('id', gameId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function applyGameAnswer({ game, expectedPosition, questionId, optionId, result }) {
  const { data, error } = await getSupabase().rpc('apply_game_answer', {
    p_game_id: game.id,
    p_expected_position: expectedPosition,
    p_question_id: questionId,
    p_option_id: optionId,
    p_current_position: game.currentPosition,
    p_answers: game.answers,
    p_status: game.status,
    p_last_response: game.lastResponse,
    p_result: result,
  });
  if (error) throw error;
  return data;
}

export async function findGameResult(gameId) {
  const { data, error } = await getSupabase().from('game_results')
    .select('id, alias, correct_count, score, created_at')
    .eq('game_id', gameId).maybeSingle();
  if (error) throw error;
  return data && {
    id: data.id,
    alias: data.alias,
    correctCount: data.correct_count,
    incorrectCount: 10 - data.correct_count,
    score: data.score,
    finishedAt: data.created_at,
  };
}

export async function getTopResults(limit) {
  const { data, error } = await getSupabase().from('game_results')
    .select('id, alias, correct_count, score, created_at, sequence')
    .order('score', { ascending: false }).order('sequence', { ascending: true }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((row, index) => ({
    rank: index + 1,
    alias: row.alias,
    correctCount: row.correct_count,
    incorrectCount: 10 - row.correct_count,
    score: row.score,
    finishedAt: row.created_at,
  }));
}
