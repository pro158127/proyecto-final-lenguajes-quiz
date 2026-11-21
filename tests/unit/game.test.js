import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { answerQuestion, createGame, Partida } from '../../src/domain/game.js';
import { Question } from '../../src/domain/question.js';
import { normalizeAlias, selectGameQuestions } from '../../src/domain/validation.js';

const bank = JSON.parse(readFileSync(resolve('src/data/regionalismos_colombia.json'), 'utf8'));
const selection = JSON.parse(readFileSync(resolve('src/data/seleccion_partida.json'), 'utf8'));
const questions = selectGameQuestions(bank, selection).map((source) => new Question(source));
const first = questions[0];
const firstId = first.id;
const start = () => createGame({
  gameId: 'game-test', alias: 'Luna', questions, createdAt: '2026-11-21T12:00:00.000Z',
});

test('U1: una respuesta correcta suma un acierto y 10 puntos', () => {
  const result = answerQuestion(start(), questions, {
    questionId: firstId,
    selectedOptionId: first.correctOptionId,
    finishedAt: '2026-11-21T12:01:00.000Z',
  });
  assert.equal(result.game.answers.length, 1);
  assert.equal(result.game.answers[0].isCorrect, true);
  assert.equal(result.response.isCorrect, true);
  assert.equal(result.game.correctCount, 1);
  assert.equal(result.game.score, 10);
});

test('U2: una respuesta incorrecta suma cero puntos', () => {
  const wrong = ['A', 'B', 'C', 'D'].find((option) => option !== first.correctOptionId);
  const result = answerQuestion(start(), questions, { questionId: firstId, selectedOptionId: wrong });
  assert.equal(result.game.answers[0].isCorrect, false);
  assert.equal(result.game.correctCount, 0);
  assert.equal(result.game.score, 0);
});

test('U3: repetir la misma respuesta no crea un segundo acierto', () => {
  const firstResult = answerQuestion(start(), questions, {
    questionId: firstId, selectedOptionId: first.correctOptionId,
  });
  const retry = answerQuestion(firstResult.game, questions, {
    questionId: firstId, selectedOptionId: first.correctOptionId,
  });
  assert.equal(retry.duplicate, true);
  assert.equal(retry.game.answers.length, 1);
  assert.equal(retry.game.correctCount, 1);
  assert.equal(retry.game.score, 10);
  assert.equal(retry.response, firstResult.response);
});

test('el alias se recorta y respeta los límites de 2 a 20 caracteres', () => {
  assert.equal(normalizeAlias('  Luna  '), 'Luna');
  assert.throws(() => normalizeAlias(' '), { code: 'INVALID_ALIAS' });
  assert.throws(() => normalizeAlias('x'), { code: 'INVALID_ALIAS' });
  assert.throws(() => normalizeAlias('123456789012345678901'), { code: 'INVALID_ALIAS' });
});

test('la selección fija contiene diez preguntas válidas y únicas', () => {
  assert.equal(questions.length, 10);
  assert.equal(new Set(selection.question_ids).size, 10);
  assert.equal(new Set(questions.map((question) => question.region)).size, 10);
});

test('una partida rechaza IDs de pregunta fuera de la secuencia', () => {
  assert.throws(() => answerQuestion(start(), questions, {
    questionId: 'q-07', selectedOptionId: 'A',
  }), { code: 'QUESTION_OUT_OF_ORDER' });
});

test('Pregunta y Partida son entidades del dominio', () => {
  const game = start();
  assert.equal(first instanceof Question, true);
  assert.equal(game instanceof Partida, true);
  assert.equal(first.toPublic(1).correctOptionId, undefined);
});

test('el resultado final cubre los extremos de 0 y 100 puntos', () => {
  for (const allCorrect of [false, true]) {
    let game = start();
    let finalResponse;
    for (const question of questions) {
      const selectedOptionId = allCorrect
        ? question.correctOptionId
        : ['A', 'B', 'C', 'D'].find((option) => option !== question.correctOptionId);
      const outcome = answerQuestion(game, questions, {
        questionId: question.id,
        selectedOptionId,
        resultId: 'result-test',
        finishedAt: '2026-11-21T12:10:00.000Z',
      });
      game = outcome.game;
      finalResponse = outcome.response;
    }
    assert.equal(finalResponse.status, 'COMPLETED');
    assert.equal(finalResponse.result.score, allCorrect ? 100 : 0);
    assert.equal(finalResponse.result.correctCount, allCorrect ? 10 : 0);
  }
});
