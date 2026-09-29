import { getOpenCells, getWinner } from '../../../shared/gameRules.js';

/**
 * Finds the best move for O using minimax with a transposition table.
 * The table stores already-evaluated board states so equivalent paths do
 * not repeat the same search work.
 */
export function findBestMove(board) {
  const openCells = getOpenCells(board);
  if (openCells.length === 0) return null;

  const memo = new Map();
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestMoves = [];

  for (const index of openCells) {
    const nextBoard = [...board];
    nextBoard[index] = 'O';
    const score = minimax(nextBoard, 'X', 0, memo);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [index];
    } else if (score === bestScore) {
      bestMoves.push(index);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function minimax(board, player, depth, memo) {
  const result = getWinner(board);

  if (result === 'O') return 10 - depth;
  if (result === 'X') return depth - 10;
  if (result === 'draw') return 0;

  const key = `${board.join('|')}:${player}`;
  if (memo.has(key)) return memo.get(key);

  const possibleScores = [];

  for (const index of getOpenCells(board)) {
    const nextBoard = [...board];
    nextBoard[index] = player;
    possibleScores.push(minimax(nextBoard, player === 'O' ? 'X' : 'O', depth + 1, memo));
  }

  const score = player === 'O'
    ? Math.max(...possibleScores)
    : Math.min(...possibleScores);

  memo.set(key, score);
  return score;
}
