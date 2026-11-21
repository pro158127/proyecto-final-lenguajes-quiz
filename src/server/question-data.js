import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { selectGameQuestions } from '../domain/validation.js';
import { Question } from '../domain/question.js';

const bank = JSON.parse(readFileSync(join(process.cwd(), 'src/data/regionalismos_colombia.json'), 'utf8'));
const selection = JSON.parse(readFileSync(join(process.cwd(), 'src/data/seleccion_partida.json'), 'utf8'));
export const gameQuestions = selectGameQuestions(bank, selection).map((source) => new Question(source));
