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

The development command starts both services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

To create and serve a production build through the backend:

```bash
npm run build
npm start
```

## Project structure

```text
.
├── frontend/
│   ├── index.html          # Semantic app shell
│   ├── vite.config.js      # Dev server and backend API proxy
│   └── src/
│       ├── main.js         # DOM rendering, input, modes, and score UI
│       └── styles.css      # Layout, theme, and responsive styles
├── backend/
│   ├── server.js           # Node HTTP server and AI API endpoint
│   └── src/ai/
│       └── minimax.js      # AI search and transposition table
├── shared/
│   └── gameRules.js        # Board validation and winning-line helpers
├── docs/
│   ├── architecture.md     # Data flow and complexity notes
│   └── github-about.md     # Suggested repository description and topics
├── package.json
└── .gitignore
```

The frontend owns presentation and interaction. The backend owns the AI's data structures and algorithmic search. The browser sends the current board to `POST /api/ai/move`, and the backend returns the selected cell index. Small board-rule helpers live in `shared/` so both sides use the same winning-line definition.

## AI algorithm and complexity

The computer uses minimax with a `Map`-based transposition table. It evaluates every legal continuation, prefers a quick win, avoids a loss, and chooses randomly between equally good opening moves so the game does not feel completely scripted.

For a generalized board, `b` is the maximum branching factor and `d` is the maximum remaining depth. Without memoization, minimax is `O(b^d)` time. The current 3×3 implementation visits each unique board state once per search, so its memoized search is bounded by the number of reachable states `S` (at most `3^9` board encodings), with `O(S + d)` auxiliary space. On this fixed board, both bounds are small; the API response is effectively constant-time from a user's perspective.

| Operation | Time complexity | Space complexity |
| --- | --- | --- |
| Validate a board | `O(9)` → `O(1)` for this game | `O(1)` |
| Check a winner | `O(8)` → `O(1)` for this game | `O(1)` |
| AI move, memoized minimax | `O(S)` visited states; naive bound `O(b^d)` | `O(S + d)` |

See [`docs/architecture.md`](docs/architecture.md) for the request flow and a fuller explanation.

## License

No license has been selected yet. Add one before publishing if you want others to reuse the code.
