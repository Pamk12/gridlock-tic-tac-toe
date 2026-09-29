# Gridlock

Gridlock is a small browser Tic-Tac-Toe game with two ways to play: challenge an unbeatable minimax AI or share the keyboard with another player.

## Features

- Play against the computer as **X** or play locally with a friend.
- Unbeatable AI powered by the minimax algorithm.
- Round score tracking for X, O, and draws.
- Winning-line highlighting and a short AI thinking delay.
- Responsive layout that works on desktop and mobile.
- Accessible game controls with button labels and live status updates.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

To create a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
.
├── index.html          # App shell and semantic page markup
├── src/
│   ├── main.js         # Game state, AI, scoring, and interactions
│   └── styles.css      # Layout, theme, and responsive styles
├── package.json        # Scripts and development dependency
├── .gitignore
└── docs/
    └── github-about.md # Suggested repository description and topics
```

## How the AI works

The computer evaluates every legal move with minimax. It prefers a quick win, avoids a loss, and chooses randomly between equally good moves so the opening does not feel completely scripted.

## License

No license has been selected yet. Add one before publishing if you want others to reuse the code.
