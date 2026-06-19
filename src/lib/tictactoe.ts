export type CellValue = "X" | "O" | null;
export type GameResult = "player" | "bot" | "draw" | null;

export interface ResultOverlayCopy {
	eyebrow: string;
	title: string;
	tone: string;
}

export const PLAYER_SYMBOL = "X";
export const BOT_SYMBOL = "O";
export const BOT_MOVE_DELAY_MS = 420;
export const CELL_IDS = [
	"cell-0",
	"cell-1",
	"cell-2",
	"cell-3",
	"cell-4",
	"cell-5",
	"cell-6",
	"cell-7",
	"cell-8",
] as const;
export const WIN_LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
] as const;

export const createEmptyBoard = (): CellValue[] =>
	Array<CellValue>(9).fill(null);

export const getAvailableMoves = (board: CellValue[]) =>
	board.flatMap((cell, index) => (cell === null ? [index] : []));

export const getWinningMove = (
	board: CellValue[],
	symbol: Exclude<CellValue, null>,
): number | null => {
	for (const [a, b, c] of WIN_LINES) {
		const line = [board[a], board[b], board[c]];
		const symbolCount = line.filter((value) => value === symbol).length;
		const emptyIndex = [a, b, c].find((index) => board[index] === null);

		if (symbolCount === 2 && emptyIndex !== undefined) {
			return emptyIndex;
		}
	}

	return null;
};

const pickRandom = (indices: number[]): number | null =>
	indices.length > 0
		? indices[Math.floor(Math.random() * indices.length)]
		: null;

const BOT_PRIORITY: Array<(board: CellValue[]) => number | null> = [
	(board) => getWinningMove(board, BOT_SYMBOL),
	(board) => getWinningMove(board, PLAYER_SYMBOL),
	(board) => (board[4] === null ? 4 : null),
	(board) => pickRandom([0, 2, 6, 8].filter((i) => board[i] === null)),
	(board) => pickRandom(getAvailableMoves(board)),
];

export const getSimpleBotMove = (board: CellValue[]): number | null => {
	for (const strategy of BOT_PRIORITY) {
		const move = strategy(board);
		if (move !== null) return move;
	}
	return null;
};

const isWinLine = (board: CellValue[], a: number, b: number, c: number) =>
	board[a] !== null && board[a] === board[b] && board[b] === board[c];

const findWinner = (board: CellValue[]): CellValue | null => {
	for (const [a, b, c] of WIN_LINES) {
		if (isWinLine(board, a, b, c)) return board[a];
	}
	return null;
};

const WIN_RESULT: Record<string, GameResult> = {
	[PLAYER_SYMBOL]: "player",
	[BOT_SYMBOL]: "bot",
};

const isDraw = (board: CellValue[]) => board.every(Boolean);

export const getGameResult = (board: CellValue[]): GameResult =>
	WIN_RESULT[findWinner(board) ?? ""] ?? (isDraw(board) ? "draw" : null);

const statusMessages: Record<"en" | "es", Record<string, string>> = {
	en: {
		player: "You won",
		bot: "You lost",
		draw: "Draw",
		default: "Your turn",
	},
	es: {
		player: "Ganaste",
		bot: "Perdiste",
		draw: "Empate",
		default: "Tu turno",
	},
};

export const getStatusCopy = (
	result: GameResult,
	lang: "en" | "es",
): string => {
	const key = result ?? "default";
	return statusMessages[lang][key] ?? statusMessages[lang].default;
};

const overlayMessages: Record<
	"en" | "es",
	Record<string, ResultOverlayCopy>
> = {
	en: {
		player: {
			eyebrow: "Victory",
			title: "You won",
			tone: "var(--status-blue)",
		},
		bot: {
			eyebrow: "Game over",
			title: "You lost",
			tone: "var(--status-green)",
		},
		draw: { eyebrow: "Game over", title: "Draw", tone: "var(--game-text)" },
	},
	es: {
		player: {
			eyebrow: "Victoria",
			title: "Ganaste",
			tone: "var(--status-blue)",
		},
		bot: {
			eyebrow: "Fin del juego",
			title: "Perdiste",
			tone: "var(--status-green)",
		},
		draw: {
			eyebrow: "Fin del juego",
			title: "Empate",
			tone: "var(--game-text)",
		},
	},
};

export const getResultOverlayCopy = (
	result: GameResult,
	lang: "en" | "es",
): ResultOverlayCopy | null => {
	if (!result) return null;
	return overlayMessages[lang][result] ?? null;
};
