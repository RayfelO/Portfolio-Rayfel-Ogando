import { RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";

interface AvatarCardProps {
	id?: string;
	lang: "en" | "es";
}

type CellValue = "X" | "O" | null;
type GameResult = "player" | "bot" | "draw" | null;

const PLAYER_SYMBOL = "X";
const BOT_SYMBOL = "O";
const BOT_MOVE_DELAY_MS = 420;
const CELL_IDS = [
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
const WIN_LINES = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
] as const;

const createEmptyBoard = (): CellValue[] => Array<CellValue>(9).fill(null);

const getAvailableMoves = (board: CellValue[]) =>
	board.flatMap((cell, index) => (cell === null ? [index] : []));

const getWinningMove = (
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

const getSimpleBotMove = (board: CellValue[]) => {
	const winningMove = getWinningMove(board, BOT_SYMBOL);
	if (winningMove !== null) {
		return winningMove;
	}

	const blockingMove = getWinningMove(board, PLAYER_SYMBOL);
	if (blockingMove !== null) {
		return blockingMove;
	}

	if (board[4] === null) {
		return 4;
	}

	const corners = [0, 2, 6, 8].filter((index) => board[index] === null);
	if (corners.length > 0) {
		return corners[Math.floor(Math.random() * corners.length)];
	}

	const remainingMoves = getAvailableMoves(board);
	if (remainingMoves.length === 0) {
		return null;
	}

	return remainingMoves[Math.floor(Math.random() * remainingMoves.length)];
};

const getGameResult = (board: CellValue[]): GameResult => {
	for (const [a, b, c] of WIN_LINES) {
		if (board[a] && board[a] === board[b] && board[b] === board[c]) {
			return board[a] === PLAYER_SYMBOL ? "player" : "bot";
		}
	}

	if (board.every((cell) => cell !== null)) {
		return "draw";
	}

	return null;
};

const getStatusCopy = (result: GameResult, lang: "en" | "es") => {
	if (lang === "en") {
		switch (result) {
			case "player":
				return "You won";
			case "bot":
				return "You lost";
			case "draw":
				return "Draw";
			default:
				return "Your turn";
		}
	}

	switch (result) {
		case "player":
			return "Ganaste";
		case "bot":
			return "Perdiste";
		case "draw":
			return "Empate";
		default:
			return "Tu turno";
	}
};

const getResultOverlayCopy = (result: GameResult, lang: "en" | "es") => {
	if (lang === "en") {
		switch (result) {
			case "player":
				return {
					eyebrow: "Victory",
					title: "You won",
					tone: "var(--status-blue)",
				};
			case "bot":
				return {
					eyebrow: "Game over",
					title: "You lost",
					tone: "var(--status-green)",
				};
			case "draw":
				return {
					eyebrow: "Game over",
					title: "Draw",
					tone: "var(--game-text)",
				};
			default:
				return null;
		}
	}

	switch (result) {
		case "player":
			return {
				eyebrow: "Victoria",
				title: "Ganaste",
				tone: "var(--status-blue)",
			};
		case "bot":
			return {
				eyebrow: "Fin del juego",
				title: "Perdiste",
				tone: "var(--status-green)",
			};
		case "draw":
			return {
				eyebrow: "Fin del juego",
				title: "Empate",
				tone: "var(--game-text)",
			};
		default:
			return null;
	}
};

export const AvatarCard: React.FC<AvatarCardProps> = ({ id, lang }) => {
	const [isGameOpen, setIsGameOpen] = useState(false);
	const [board, setBoard] = useState<CellValue[]>(() => createEmptyBoard());
	const [result, setResult] = useState<GameResult>(null);
	const [isBotThinking, setIsBotThinking] = useState(false);
	const [hoveredCell, setHoveredCell] = useState<number | null>(null);
	const [hoveredAction, setHoveredAction] = useState<"reset" | "close" | null>(
		null,
	);
	const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

	const canInteract = isGameOpen && !result && !isBotThinking;
	const statusCopy = useMemo(() => getStatusCopy(result, lang), [lang, result]);
	const resultOverlayCopy = useMemo(
		() => getResultOverlayCopy(result, lang),
		[lang, result],
	);

	const resetGame = () => {
		setBoard(createEmptyBoard());
		setResult(null);
		setIsBotThinking(false);
		setHoveredCell(null);
	};

	const closeGame = () => {
		setIsGameOpen(false);
		setHoveredAction(null);
		resetGame();
	};

	const openGame = () => {
		setIsGameOpen(true);
		setHoveredAction(null);
		resetGame();
	};

	useEffect(() => {
		if (!isGameOpen || result || !isBotThinking) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setBoard((currentBoard) => {
				const move = getSimpleBotMove(currentBoard);

				if (move === null) {
					setIsBotThinking(false);
					return currentBoard;
				}

				const nextBoard = [...currentBoard];
				nextBoard[move] = BOT_SYMBOL;
				setResult(getGameResult(nextBoard));
				setIsBotThinking(false);
				return nextBoard;
			});
		}, BOT_MOVE_DELAY_MS);

		return () => window.clearTimeout(timeoutId);
	}, [isBotThinking, isGameOpen, result]);

	const handleCellClick = (index: number) => {
		if (!canInteract || board[index] !== null) {
			return;
		}

		const nextBoard = [...board];
		nextBoard[index] = PLAYER_SYMBOL;
		const nextResult = getGameResult(nextBoard);

		setBoard(nextBoard);
		setResult(nextResult);

		if (!nextResult) {
			setIsBotThinking(true);
		}
	};

	return (
		<motion.div
			id={id}
			variants={cardVariants}
			{...cardHoverProps}
			className="bento-card bento-col-1 relative overflow-hidden p-0 border border-[var(--border-default)] hover:border-[var(--border-hover)] group min-[581px]:min-h-[180px] min-[900px]:min-h-[260px] max-[580px]:w-[min(100%,340px)] max-[580px]:justify-self-center max-[580px]:aspect-square max-[580px]:min-h-0"
		>
			<motion.button
				type="button"
				onClick={() => {
					if (!isGameOpen) {
						openGame();
					}
				}}
				className="absolute inset-0 h-full w-full cursor-pointer"
				aria-label={
					lang === "es"
						? "Abrir easter egg de tic tac toe"
						: "Open tic tac toe easter egg"
				}
			>
				<motion.img
					src="https://avatars.githubusercontent.com/u/141379819?v=4"
					alt=""
					loading="eager"
					onLoad={() => setIsAvatarLoaded(true)}
					onError={() => setIsAvatarLoaded(true)}
					className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover min-[900px]:object-center min-[581px]:max-[899px]:object-top max-[580px]:object-center"
					style={{ scaleX: -1, opacity: isAvatarLoaded ? 1 : 0 }}
					whileHover={isGameOpen ? undefined : { scaleX: -1.05, scaleY: 1.05 }}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
				/>
				{!isAvatarLoaded && (
					<div className="absolute inset-0 z-[5] flex items-center justify-center bg-[var(--bg-card)]">
						<span className="text-[13px] font-mono text-secondary">
							{lang === "es" ? "Cargando..." : "Loading..."}
						</span>
					</div>
				)}
				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
					style={{
						background:
							"linear-gradient(to top, var(--game-photo-vignette-start), var(--game-photo-vignette-mid), transparent)",
					}}
				/>
			</motion.button>

			<AnimatePresence>
				{isGameOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="absolute inset-0 z-10 grid grid-rows-[auto_1fr] p-3 max-[580px]:p-2 backdrop-blur-[3px]"
						style={{
							background:
								"linear-gradient(135deg, var(--game-overlay-start) 0%, var(--game-overlay-end) 92%)",
						}}
					>
						<div className="flex items-center justify-between gap-2 select-none">
							<div className="min-w-0">
								<p
									className="font-mono text-[10px] max-[580px]:text-[8.5px] uppercase tracking-[0.18em]"
									style={{ color: "var(--status-blue)" }}
								>
									Tic tac toe
								</p>
								<p
									className="text-[13px] max-[580px]:text-[11px] font-semibold"
									style={{ color: "var(--game-text)" }}
								>
									{result
										? lang === "es"
											? "Resultado"
											: "Result"
										: isBotThinking
											? lang === "es"
												? "Pensando..."
												: "Thinking..."
											: statusCopy}
								</p>
							</div>

							<div className="flex items-center gap-1.5">
								<motion.button
									whileHover={{ scale: 1.06 }}
									whileTap={{ scale: 0.94 }}
									type="button"
									onClick={resetGame}
									onHoverStart={() => setHoveredAction("reset")}
									onHoverEnd={() =>
										setHoveredAction((current) =>
											current === "reset" ? null : current,
										)
									}
									className="inline-flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-colors"
									style={{
										borderColor: "var(--game-border)",
										background:
											hoveredAction === "reset"
												? "var(--game-icon-button-hover)"
												: "var(--game-icon-button-bg)",
										color: "var(--status-blue)",
									}}
									aria-label={
										lang === "es" ? "Reiniciar juego" : "Restart game"
									}
								>
									<RotateCcw size={14} />
								</motion.button>
								<motion.button
									whileHover={{ scale: 1.06 }}
									whileTap={{ scale: 0.94 }}
									type="button"
									onClick={closeGame}
									onHoverStart={() => setHoveredAction("close")}
									onHoverEnd={() =>
										setHoveredAction((current) =>
											current === "close" ? null : current,
										)
									}
									className="inline-flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-colors"
									style={{
										borderColor: "var(--game-border)",
										background:
											hoveredAction === "close"
												? "var(--game-icon-button-hover)"
												: "var(--game-icon-button-bg)",
										color: "var(--status-blue)",
									}}
									aria-label={lang === "es" ? "Cerrar juego" : "Close game"}
								>
									<X size={14} />
								</motion.button>
							</div>
						</div>

						<div className="flex items-center justify-center min-h-0">
							<div className="grid grid-cols-3 gap-2 max-[580px]:gap-1.5 aspect-square w-full max-w-[220px] min-[581px]:max-[899px]:max-w-[180px] max-[580px]:max-w-[170px]">
								{board.map((cell, index) => (
									<motion.button
										key={CELL_IDS[index]}
										whileHover={
											canInteract && cell === null ? { scale: 1.04 } : undefined
										}
										whileTap={
											canInteract && cell === null ? { scale: 0.94 } : undefined
										}
										type="button"
										onClick={() => handleCellClick(index)}
										onHoverStart={() => {
											if (canInteract && cell === null) {
												setHoveredCell(index);
											}
										}}
										onHoverEnd={() => {
											setHoveredCell((current) =>
												current === index ? null : current,
											);
										}}
										disabled={!canInteract || cell !== null}
										className={`relative aspect-square rounded-2xl border transition-colors ${
											canInteract && cell === null
												? "cursor-pointer"
												: "cursor-default"
										}`}
										style={{
											borderColor: "var(--game-border)",
											background:
												cell === null
													? hoveredCell === index
														? "var(--game-surface-hover)"
														: "var(--game-surface)"
													: "var(--game-surface-filled)",
										}}
										aria-label={
											lang === "es"
												? `Casilla ${index + 1}`
												: `Cell ${index + 1}`
										}
									>
										<AnimatePresence mode="wait">
											{cell && (
												<motion.span
													key={cell}
													initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
													animate={{ opacity: 1, scale: 1, rotate: 0 }}
													exit={{ opacity: 0, scale: 0.5 }}
													transition={{
														type: "spring",
														stiffness: 420,
														damping: 22,
													}}
													className="text-[24px] max-[580px]:text-[20px] sm:text-[28px] font-black tracking-tight"
													style={{
														color:
															cell === PLAYER_SYMBOL
																? "var(--status-blue)"
																: "var(--status-green)",
													}}
												>
													{cell}
												</motion.span>
											)}
										</AnimatePresence>
									</motion.button>
								))}
							</div>
						</div>

						<AnimatePresence>
							{resultOverlayCopy && (
								<>
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.18 }}
										className="absolute inset-0 rounded-[inherit] backdrop-blur-[5px]"
										style={{ background: "var(--game-backdrop)" }}
									/>
									<motion.div
										initial={{ opacity: 0, scale: 0.92, y: 10 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.94, y: -8 }}
										transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
										className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-2xl border px-4 py-3 max-[580px]:px-3 max-[580px]:py-2 text-center backdrop-blur-md"
										style={{
											borderColor: "var(--game-border)",
											background: "var(--game-result-surface)",
											boxShadow: "var(--game-result-shadow)",
											color: "var(--game-text)",
										}}
									>
										{result === "player" && (
											<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
												{Array.from({ length: 14 }).map((_, index) => {
													const left = 8 + ((index * 7) % 84);
													const delay = index * 0.035;
													const duration = 0.8 + (index % 3) * 0.12;
													const color =
														index % 2 === 0
															? "var(--status-blue)"
															: "var(--status-green)";

													return (
														<motion.span
															key={`confetti-${left}-${delay}`}
															initial={{ opacity: 0, y: -18, rotate: 0 }}
															animate={{
																opacity: [0, 1, 1, 0],
																y: [-18, 18, 46, 70],
																rotate: [0, 65, 130, 180],
															}}
															transition={{
																duration,
																delay,
																ease: "easeOut",
															}}
															className="absolute top-2 h-2.5 w-1 rounded-full"
															style={{
																left: `${left}%`,
																backgroundColor: color,
															}}
														/>
													);
												})}
											</div>
										)}

										<p
											className="relative font-mono text-[10px] uppercase tracking-[0.18em]"
											style={{ color: resultOverlayCopy.tone }}
										>
											{resultOverlayCopy.eyebrow}
										</p>
										<p
											className="relative mt-1 text-[18px] max-[580px]:text-[15px] font-bold"
											style={{ color: "var(--game-text)" }}
										>
											{resultOverlayCopy.title}
										</p>
										<div className="relative mt-3 flex items-center justify-center gap-2">
											<motion.button
												whileHover={{ scale: 1.04 }}
												whileTap={{ scale: 0.96 }}
												type="button"
												onClick={resetGame}
												className="inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 max-[580px]:px-2.5 max-[580px]:py-1 text-[12px] max-[580px]:text-[11px] font-semibold transition-colors"
												style={{
													borderColor: "var(--game-border)",
													background: "var(--game-surface-strong)",
													color: "var(--game-text)",
												}}
											>
												<RotateCcw size={12} />
												{lang === "es" ? "Reiniciar" : "Restart"}
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.04 }}
												whileTap={{ scale: 0.96 }}
												type="button"
												onClick={closeGame}
												className="inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 max-[580px]:px-2.5 max-[580px]:py-1 text-[12px] max-[580px]:text-[11px] font-semibold transition-colors"
												style={{
													borderColor: "var(--game-border)",
													background: "var(--game-surface)",
													color: "var(--game-text)",
												}}
											>
												<X size={12} />
												{lang === "es" ? "Cerrar" : "Close"}
											</motion.button>
										</div>
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
