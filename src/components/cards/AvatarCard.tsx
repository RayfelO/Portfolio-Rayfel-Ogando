import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type {
	CellValue,
	GameResult,
	ResultOverlayCopy,
} from "../../lib/tictactoe";
import {
	BOT_MOVE_DELAY_MS,
	BOT_SYMBOL,
	createEmptyBoard,
	getGameResult,
	getResultOverlayCopy,
	getSimpleBotMove,
	getStatusCopy,
	PLAYER_SYMBOL,
} from "../../lib/tictactoe";
import { cardHoverProps, cardVariants } from "../layout/BentoGrid";
import { LoadingMedia } from "../media/LoadingMedia";
import { TicTacToeGame } from "./TicTacToeGame";

function useBotMoveHandler(
	isGameOpen: boolean,
	result: GameResult,
	isBotThinking: boolean,
	setBoard: (board: CellValue[] | ((prev: CellValue[]) => CellValue[])) => void,
	setResult: (result: GameResult) => void,
	setIsBotThinking: (v: boolean) => void,
) {
	useEffect(() => {
		if (!isGameOpen || result || !isBotThinking) return;

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
	}, [
		isBotThinking,
		isGameOpen,
		result,
		setBoard,
		setResult,
		setIsBotThinking,
	]);
}

function useGameActions(
	board: CellValue[],
	canInteract: boolean,
	setBoard: (board: CellValue[] | ((prev: CellValue[]) => CellValue[])) => void,
	setResult: (result: GameResult) => void,
	setIsBotThinking: (v: boolean) => void,
	setHoveredCell: (v: number | null) => void,
	setIsGameOpen: (v: boolean) => void,
	setHoveredAction: (v: "reset" | "close" | null) => void,
) {
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
	const handleCellClick = (index: number) => {
		if (!canInteract || board[index] !== null) return;
		const nb = [...board];
		nb[index] = PLAYER_SYMBOL;
		const nr = getGameResult(nb);
		setBoard(nb);
		setResult(nr);
		if (!nr) setIsBotThinking(true);
	};
	return { resetGame, closeGame, openGame, handleCellClick };
}

function useGameLogic(lang: "en" | "es") {
	const [isGameOpen, setIsGameOpen] = useState(false);
	const [board, setBoard] = useState<CellValue[]>(() => createEmptyBoard());
	const [result, setResult] = useState<GameResult>(null);
	const [isBotThinking, setIsBotThinking] = useState(false);
	const [hoveredCell, setHoveredCell] = useState<number | null>(null);
	const [hoveredAction, setHoveredAction] = useState<"reset" | "close" | null>(
		null,
	);

	const canInteract = isGameOpen && !result && !isBotThinking;
	const statusCopy = useMemo(() => getStatusCopy(result, lang), [lang, result]);
	const resultOverlayCopy = useMemo(
		() => getResultOverlayCopy(result, lang),
		[lang, result],
	);
	const { resetGame, closeGame, openGame, handleCellClick } = useGameActions(
		board,
		canInteract,
		setBoard,
		setResult,
		setIsBotThinking,
		setHoveredCell,
		setIsGameOpen,
		setHoveredAction,
	);

	useBotMoveHandler(
		isGameOpen,
		result,
		isBotThinking,
		setBoard,
		setResult,
		setIsBotThinking,
	);

	return {
		isGameOpen,
		board,
		result,
		isBotThinking,
		canInteract,
		statusCopy,
		resultOverlayCopy,
		hoveredCell,
		hoveredAction,
		setHoveredCell,
		setHoveredAction,
		resetGame,
		closeGame,
		openGame,
		handleCellClick,
	};
}

const getAvatarAriaLabel = (lang: "en" | "es"): string =>
	lang === "es"
		? "Abrir easter egg de tic tac toe"
		: "Open tic tac toe easter egg";

const getAvatarHoverProps = (isGameOpen: boolean) =>
	isGameOpen ? {} : { scaleX: -1.05, scaleY: 1.05 };

const AvatarDisplay: React.FC<{
	isGameOpen: boolean;
	openGame: () => void;
	lang: "en" | "es";
}> = ({ isGameOpen, openGame, lang }) => (
	<motion.button
		type="button"
		onClick={() => {
			if (!isGameOpen) {
				openGame();
			}
		}}
		className="absolute inset-0 h-full w-full cursor-pointer"
		aria-label={getAvatarAriaLabel(lang)}
	>
		<LoadingMedia lang={lang} className="absolute inset-0 h-full w-full">
			{({ onLoad, onError, style }) => (
				<motion.img
					src="https://avatars.githubusercontent.com/u/141379819?v=4"
					alt=""
					loading="eager"
					onLoad={onLoad}
					onError={onError}
					className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover min-[900px]:object-center min-[581px]:max-[899px]:object-top max-[580px]:object-center"
					style={{ scaleX: -1, ...style }}
					whileHover={getAvatarHoverProps(isGameOpen)}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
				/>
			)}
		</LoadingMedia>
		<div
			className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 z-20"
			style={{
				background:
					"linear-gradient(to top, var(--game-photo-vignette-start), var(--game-photo-vignette-mid), transparent)",
			}}
		/>
	</motion.button>
);

const GameOverlay: React.FC<{
	isOpen: boolean;
	board: CellValue[];
	result: GameResult;
	isBotThinking: boolean;
	canInteract: boolean;
	statusCopy: string;
	resultOverlayCopy: ResultOverlayCopy | null;
	hoveredCell: number | null;
	hoveredAction: "reset" | "close" | null;
	lang: "en" | "es";
	onCellClick: (index: number) => void;
	onReset: () => void;
	onClose: () => void;
	onHoverCell: (index: number | null) => void;
	onHoverAction: (action: "reset" | "close" | null) => void;
}> = ({
	isOpen,
	board,
	result,
	isBotThinking,
	canInteract,
	statusCopy,
	resultOverlayCopy,
	hoveredCell,
	hoveredAction,
	lang,
	onCellClick,
	onReset,
	onClose,
	onHoverCell,
	onHoverAction,
}) => (
	<AnimatePresence>
		{isOpen && (
			<TicTacToeGame
				board={board}
				result={result}
				isBotThinking={isBotThinking}
				canInteract={canInteract}
				statusCopy={statusCopy}
				resultOverlayCopy={resultOverlayCopy}
				hoveredCell={hoveredCell}
				hoveredAction={hoveredAction}
				lang={lang}
				onCellClick={onCellClick}
				onReset={onReset}
				onClose={onClose}
				onHoverCell={onHoverCell}
				onHoverAction={onHoverAction}
			/>
		)}
	</AnimatePresence>
);

interface AvatarCardProps {
	id?: string;
	lang: "en" | "es";
	className?: string;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({
	id,
	lang,
	className,
}) => {
	const {
		isGameOpen,
		board,
		result,
		isBotThinking,
		canInteract,
		statusCopy,
		resultOverlayCopy,
		hoveredCell,
		hoveredAction,
		setHoveredCell,
		setHoveredAction,
		resetGame,
		closeGame,
		openGame,
		handleCellClick,
	} = useGameLogic(lang);

	return (
		<motion.div
			id={id}
			variants={cardVariants}
			{...cardHoverProps}
			className={`bento-card bento-col-1 relative overflow-hidden p-0 border border-[var(--border-default)] hover:border-[var(--border-hover)] group min-[581px]:min-h-[180px] min-[900px]:min-h-[260px] max-[580px]:w-[min(100%,340px)] max-[580px]:justify-self-center max-[580px]:aspect-square max-[580px]:min-h-0 ${className || ""}`}
		>
			<AvatarDisplay isGameOpen={isGameOpen} openGame={openGame} lang={lang} />
			<GameOverlay
				isOpen={isGameOpen}
				board={board}
				result={result}
				isBotThinking={isBotThinking}
				canInteract={canInteract}
				statusCopy={statusCopy}
				resultOverlayCopy={resultOverlayCopy}
				hoveredCell={hoveredCell}
				hoveredAction={hoveredAction}
				lang={lang}
				onCellClick={handleCellClick}
				onReset={resetGame}
				onClose={closeGame}
				onHoverCell={setHoveredCell}
				onHoverAction={setHoveredAction}
			/>
		</motion.div>
	);
};
