import { RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import type {
	CellValue,
	GameResult,
	ResultOverlayCopy,
} from "../../lib/tictactoe";
import { CELL_IDS, PLAYER_SYMBOL } from "../../lib/tictactoe";

interface TicTacToeGameProps {
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
}

interface GameHeaderProps {
	lang: "en" | "es";
	result: GameResult;
	isBotThinking: boolean;
	statusCopy: string;
	hoveredAction: "reset" | "close" | null;
	onReset: () => void;
	onClose: () => void;
	onHoverAction: (action: "reset" | "close" | null) => void;
}

interface GameIconButtonProps {
	icon: ReactNode;
	action: "reset" | "close";
	hoveredAction: "reset" | "close" | null;
	onClick: () => void;
	onHoverAction: (action: "reset" | "close" | null) => void;
	lang: "en" | "es";
}

const ICON_LABELS = {
	reset: { es: "Reiniciar juego", en: "Restart game" },
	close: { es: "Cerrar juego", en: "Close game" },
} as const;

const STATUS_TEXT: Record<string, Record<string, string>> = {
	result: { es: "Resultado", en: "Result" },
	thinking: { es: "Pensando...", en: "Thinking..." },
};

function getCellBackground(
	cell: CellValue,
	index: number,
	hoveredCell: number | null,
): string {
	if (cell !== null) return "var(--game-surface-filled)";
	if (hoveredCell === index) return "var(--game-surface-hover)";
	return "var(--game-surface)";
}

function getCellClassName(cell: CellValue, canInteract: boolean): string {
	return canInteract && cell === null ? "cursor-pointer" : "cursor-default";
}

function getCellColor(cell: CellValue): string {
	return cell === PLAYER_SYMBOL ? "var(--status-blue)" : "var(--status-green)";
}

function getCellLabel(index: number, lang: "en" | "es"): string {
	return lang === "es" ? `Casilla ${index + 1}` : `Cell ${index + 1}`;
}

function getCellHover(canInteract: boolean, cell: CellValue) {
	return canInteract && cell === null ? { scale: 1.04 } : undefined;
}

function getCellTap(canInteract: boolean, cell: CellValue) {
	return canInteract && cell === null ? { scale: 0.94 } : undefined;
}

function getStatusText(
	result: GameResult,
	isBotThinking: boolean,
	statusCopy: string,
	lang: "en" | "es",
): string {
	if (result) return STATUS_TEXT.result[lang];
	if (isBotThinking) return STATUS_TEXT.thinking[lang];
	return statusCopy;
}

const GameIconButton: React.FC<GameIconButtonProps> = ({
	icon,
	action,
	hoveredAction,
	onClick,
	onHoverAction,
	lang,
}) => (
	<motion.button
		whileHover={{ scale: 1.06 }}
		whileTap={{ scale: 0.94 }}
		type="button"
		onClick={onClick}
		onHoverStart={() => onHoverAction(action)}
		onHoverEnd={() =>
			onHoverAction(hoveredAction === action ? null : hoveredAction)
		}
		className="inline-flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full border transition-colors"
		style={{
			borderColor: "var(--game-border)",
			background:
				hoveredAction === action
					? "var(--game-icon-button-hover)"
					: "var(--game-icon-button-bg)",
			color: "var(--status-blue)",
		}}
		aria-label={ICON_LABELS[action][lang]}
	>
		{icon}
	</motion.button>
);

const GameHeader: React.FC<GameHeaderProps> = ({
	lang,
	result,
	isBotThinking,
	statusCopy,
	hoveredAction,
	onReset,
	onClose,
	onHoverAction,
}) => (
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
				{getStatusText(result, isBotThinking, statusCopy, lang)}
			</p>
		</div>

		<div className="flex items-center gap-1.5">
			<GameIconButton
				icon={<RotateCcw size={14} />}
				action="reset"
				hoveredAction={hoveredAction}
				onClick={onReset}
				onHoverAction={onHoverAction}
				lang={lang}
			/>
			<GameIconButton
				icon={<X size={14} />}
				action="close"
				hoveredAction={hoveredAction}
				onClick={onClose}
				onHoverAction={onHoverAction}
				lang={lang}
			/>
		</div>
	</div>
);

interface BoardCellProps {
	cell: CellValue;
	index: number;
	canInteract: boolean;
	hoveredCell: number | null;
	lang: "en" | "es";
	onCellClick: (index: number) => void;
	onHoverCell: (index: number | null) => void;
}

const BoardCell: React.FC<BoardCellProps> = ({
	cell,
	index,
	canInteract,
	hoveredCell,
	lang,
	onCellClick,
	onHoverCell,
}) => (
	<motion.button
		whileHover={getCellHover(canInteract, cell)}
		whileTap={getCellTap(canInteract, cell)}
		type="button"
		onClick={() => onCellClick(index)}
		onHoverStart={() => {
			if (canInteract && cell === null) {
				onHoverCell(index);
			}
		}}
		onHoverEnd={() => {
			onHoverCell(hoveredCell === index ? null : hoveredCell);
		}}
		disabled={!canInteract || cell !== null}
		className={`relative aspect-square rounded-2xl border transition-colors ${getCellClassName(cell, canInteract)}`}
		style={{
			borderColor: "var(--game-border)",
			background: getCellBackground(cell, index, hoveredCell),
		}}
		aria-label={getCellLabel(index, lang)}
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
					style={{ color: getCellColor(cell) }}
				>
					{cell}
				</motion.span>
			)}
		</AnimatePresence>
	</motion.button>
);

const ConfettiEffect: React.FC = () => (
	<div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
		{Array.from({ length: 14 }).map((_, index) => {
			const left = 8 + ((index * 7) % 84);
			const delay = index * 0.035;
			const duration = 0.8 + (index % 3) * 0.12;
			const color =
				index % 2 === 0 ? "var(--status-blue)" : "var(--status-green)";

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
);

interface ResultOverlayActionsProps {
	onReset: () => void;
	onClose: () => void;
	lang: "en" | "es";
}

const ResultOverlayActions: React.FC<ResultOverlayActionsProps> = ({
	onReset,
	onClose,
	lang,
}) => (
	<div className="relative mt-3 flex items-center justify-center gap-2">
		<motion.button
			whileHover={{ scale: 1.04 }}
			whileTap={{ scale: 0.96 }}
			type="button"
			onClick={onReset}
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
			onClick={onClose}
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
);

interface GameBoardViewProps {
	board: CellValue[];
	canInteract: boolean;
	hoveredCell: number | null;
	lang: "en" | "es";
	onCellClick: (index: number) => void;
	onHoverCell: (index: number | null) => void;
}

const GameBoardView: React.FC<GameBoardViewProps> = ({
	board,
	canInteract,
	hoveredCell,
	lang,
	onCellClick,
	onHoverCell,
}) => (
	<div className="flex items-center justify-center min-h-0">
		<div className="grid grid-cols-3 gap-2 max-[580px]:gap-1.5 aspect-square w-full max-w-[220px] min-[581px]:max-[899px]:max-w-[180px] max-[580px]:max-w-[170px]">
			{board.map((cell, index) => (
				<BoardCell
					key={CELL_IDS[index]}
					cell={cell}
					index={index}
					canInteract={canInteract}
					hoveredCell={hoveredCell}
					lang={lang}
					onCellClick={onCellClick}
					onHoverCell={onHoverCell}
				/>
			))}
		</div>
	</div>
);

interface GameResultOverlayProps {
	result: GameResult;
	resultOverlayCopy: ResultOverlayCopy;
	lang: "en" | "es";
	onReset: () => void;
	onClose: () => void;
}

const GameResultOverlay: React.FC<GameResultOverlayProps> = ({
	result,
	resultOverlayCopy,
	lang,
	onReset,
	onClose,
}) => (
	<AnimatePresence>
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
			{result === "player" && <ConfettiEffect />}

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
			<ResultOverlayActions onReset={onReset} onClose={onClose} lang={lang} />
		</motion.div>
	</AnimatePresence>
);

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
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
}) => {
	return (
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
			<GameHeader
				lang={lang}
				result={result}
				isBotThinking={isBotThinking}
				statusCopy={statusCopy}
				hoveredAction={hoveredAction}
				onReset={onReset}
				onClose={onClose}
				onHoverAction={onHoverAction}
			/>
			<GameBoardView
				board={board}
				canInteract={canInteract}
				hoveredCell={hoveredCell}
				lang={lang}
				onCellClick={onCellClick}
				onHoverCell={onHoverCell}
			/>

			{resultOverlayCopy && (
				<GameResultOverlay
					result={result}
					resultOverlayCopy={resultOverlayCopy}
					lang={lang}
					onReset={onReset}
					onClose={onClose}
				/>
			)}
		</motion.div>
	);
};
