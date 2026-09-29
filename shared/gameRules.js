export const WINNING_LINES = Object.freeze([
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]);

const VALID_MARKS = new Set(['', 'X', 'O']);

export function getWinningLine(board, player) {
  return WINNING_LINES.find((line) => line.every((index) => board[index] === player));
}

export function getWinner(board) {
  const winningLine = WINNING_LINES.find(([first, second, third]) => (
    board[first] && board[first] === board[second] && board[first] === board[third]
  ));

  if (winningLine) return board[winningLine[0]];
  if (board.every(Boolean)) return 'draw';
  return null;
}

export function getOpenCells(board) {
  return board.reduce((openCells, mark, index) => {
    if (!mark) openCells.push(index);
    return openCells;
  }, []);
}

export function isValidBoard(board) {
  return Array.isArray(board)
    && board.length === 9
    && board.every((mark) => VALID_MARKS.has(mark));
}
