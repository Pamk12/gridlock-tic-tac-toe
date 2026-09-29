# Gridlock architecture

## Responsibilities

### Frontend

`frontend/` contains browser-only code:

- `index.html` provides the accessible page structure.
- `src/styles.css` contains the visual theme, layout, and responsive rules.
- `src/main.js` owns DOM events, board rendering, modes, score display, and the request to the AI API.

The frontend does not contain the minimax implementation. This keeps presentation changes independent from the AI algorithm.

### Backend

`backend/` contains the Node.js service:

- `server.js` exposes `GET /api/health` and `POST /api/ai/move`.
- `src/ai/minimax.js` contains the AI search, legal move enumeration, and `Map` transposition table.

The backend also serves the built frontend when started with `npm start`.

### Shared rules

`shared/gameRules.js` contains the small set of rules both layers need: the eight winning lines, winner detection, open-cell discovery, and board-shape validation. Keeping these helpers shared prevents the UI and API from drifting apart.

## AI request flow

1. Player X clicks an empty cell in the frontend.
2. The frontend updates the board and sends the nine-cell board to `POST /api/ai/move`.
3. The backend validates the board and confirms it is O's turn.
4. `findBestMove()` explores legal continuations with minimax.
5. The backend returns `{ "index": number }`.
6. The frontend renders O's move and continues the round.

## Complexity

For a generalized game tree, minimax has time complexity `O(b^d)`, where `b` is the branching factor and `d` is the remaining depth. On a 3×3 board, `b ≤ 9` and `d ≤ 9`. The implementation adds a transposition table (`Map`) keyed by board state and player, so repeated board states are evaluated once during a search. If `S` is the number of unique states reached, the memoized search is `O(S)` time and `O(S + d)` space, including the recursion stack.

The current game has a fixed board size, so board validation and winner detection inspect a constant number of cells: `O(1)` in practice.
