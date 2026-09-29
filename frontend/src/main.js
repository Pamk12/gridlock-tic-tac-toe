import { getWinningLine } from '../../shared/gameRules.js';

const boardElement = document.querySelector('#board');
const statusElement = document.querySelector('#status');
const hintElement = document.querySelector('#hint');
const resetButton = document.querySelector('#reset');
const modeButtons = [...document.querySelectorAll('.mode-btn')];

const scores = { X: 0, O: 0, draws: 0 };

let cells = [];
let board = [];
let currentPlayer = 'X';
let gameOver = false;
let computerThinking = false;
let gameMode = 'ai';
let roundId = 0;

function startRound() {
  roundId += 1;
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  computerThinking = false;

  boardElement.replaceChildren();

  for (let index = 0; index < 9; index += 1) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.type = 'button';
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `Empty tile ${index + 1}`);
    cell.addEventListener('click', () => handleMove(index));
    boardElement.append(cell);
  }

  cells = [...boardElement.children];
  statusElement.textContent = gameMode === 'ai' ? 'Your turn — place X' : "Player X's turn";
  render();
}

function handleMove(index, actor = 'human') {
  const isComputerTurn = gameMode === 'ai' && currentPlayer === 'O';

  if (gameOver || computerThinking || board[index] || (isComputerTurn && actor !== 'computer')) {
    return;
  }

  board[index] = currentPlayer;
  drawMove(index);

  const winningLine = getWinningLine(board, currentPlayer);

  if (winningLine) {
    winningLine.forEach((cellIndex) => cells[cellIndex].classList.add('win'));
    scores[currentPlayer] += 1;
    gameOver = true;
    statusElement.textContent = gameMode === 'ai'
      ? currentPlayer === 'X' ? 'You win! 🎉' : 'AI wins this round.'
      : `Player ${currentPlayer} wins!`;
  } else if (board.every(Boolean)) {
    scores.draws += 1;
    gameOver = true;
    statusElement.textContent = "It's a draw — well played.";
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusElement.textContent = gameMode === 'ai'
      ? currentPlayer === 'X' ? 'Your turn — place X' : 'AI is thinking…'
      : `Player ${currentPlayer}'s turn`;
  }

  render();

  if (!gameOver && gameMode === 'ai' && currentPlayer === 'O') {
    scheduleComputerMove();
  }
}

function drawMove(index) {
  const cell = cells[index];
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.setAttribute('aria-label', `Tile ${index + 1}: ${currentPlayer}`);
}

function scheduleComputerMove() {
  const scheduledRound = roundId;
  computerThinking = true;
  render();

  window.setTimeout(async () => {
    if (scheduledRound !== roundId || gameOver) return;

    try {
      const response = await fetch('/api/ai/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'The AI service could not choose a move.');
      }

      const { index } = await response.json();
      if (!Number.isInteger(index) || board[index]) {
        throw new Error('The AI service returned an invalid move.');
      }

      computerThinking = false;
      handleMove(index, 'computer');
    } catch (error) {
      computerThinking = false;
      statusElement.textContent = `AI unavailable: ${error.message}`;
      render();
    }
  }, 420);
}

function setMode(nextMode) {
  if (nextMode === gameMode) return;

  gameMode = nextMode;
  modeButtons.forEach((button) => {
    const isSelected = button.dataset.mode === gameMode;
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
  startRound();
}

function render() {
  document.querySelector('#xScore .value').textContent = scores.X;
  document.querySelector('#oScore .value').textContent = scores.O;
  document.querySelector('#drawScore .value').textContent = scores.draws;
  document.querySelector('#xScore .label').textContent = gameMode === 'ai' ? 'YOU • X' : 'PLAYER X';
  document.querySelector('#oScore .label').textContent = gameMode === 'ai' ? 'AI • O' : 'PLAYER O';
  document.querySelector('#xScore').classList.toggle('active', !gameOver && !computerThinking && currentPlayer === 'X');
  document.querySelector('#oScore').classList.toggle('active', !gameOver && (computerThinking || currentPlayer === 'O'));
  hintElement.textContent = gameMode === 'ai' ? 'You are X • the AI is O' : 'Take turns with a friend';

  cells.forEach((cell) => {
    cell.disabled = gameOver || computerThinking || Boolean(cell.textContent);
  });
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

resetButton.addEventListener('click', startRound);
startRound();
