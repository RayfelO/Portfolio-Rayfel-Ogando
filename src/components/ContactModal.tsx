import { AlertCircle, CheckCircle2, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { Translations } from "../i18n/translations";
import { track } from "../lib/analytics";
import { sendContactMessage } from "../lib/contact";

interface ContactModalProps {
	isOpen: boolean;
	onClose: () => void;
	t: Translations;
}

export const ContactModal: React.FC<ContactModalProps> = ({
	isOpen,
	onClose,
	t,
}) => {
	const [reason, setReason] = useState<string | null>(null);
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	// Validation errors
	const [emailError, setEmailError] = useState<string | null>(null);
	const [messageError, setMessageError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Loading/Success state
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const panelRef = useRef<HTMLDivElement>(null);

	// Close on ESC key press
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			// Reset form states on open
			setReason(null);
			setEmail("");
			setMessage("");
			setEmailError(null);
			setMessageError(null);
			setSubmitError(null);
			setSuccess(false);
			setLoading(false);
		}
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	// Handle overlay background click to close
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
			onClose();
		}
	};

	// Field validation functions
	const validateEmail = (val: string) => {
		if (!val) {
			setEmailError("Email is required");
			return false;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(val)) {
			setEmailError(
				t.contactModal.errorMessage.includes("¡")
					? "Email inválido"
					: "Invalid email format",
			);
			return false;
		}
		setEmailError(null);
		return true;
	};

	const validateMessage = (val: string) => {
		if (!val || val.trim().length < 10) {
			setMessageError(
				t.contactModal.errorMessage.includes("¡")
					? "Mínimo 10 caracteres"
					: "Minimum 10 characters",
			);
			return false;
		}
		if (val.length > 500) {
			setMessageError(
				t.contactModal.errorMessage.includes("¡")
					? "Máximo 500 caracteres"
					: "Maximum 500 characters",
			);
			return false;
		}
		setMessageError(null);
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (!reason) {
			track.contactFormError("reason");
			return;
		}

		const isEmailValid = validateEmail(email);
		const isMsgValid = validateMessage(message);

		if (!isEmailValid) {
			track.contactFormError("email");
			return;
		}
		if (!isMsgValid) {
			track.contactFormError("message");
			return;
		}

		setLoading(true);

		const result = await sendContactMessage({
			reason,
			email,
			message,
		});

		setLoading(false);

		if (result.success) {
			setSuccess(true);
			track.contactFormSubmitted(reason);
		} else {
			setSubmitError(result.error || t.contactModal.errorMessage);
			track.contactFormError("submit_failed");
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					onClick={handleOverlayClick}
					className="modal-overlay"
				>
					{/* Panel */}
					<motion.div
						ref={panelRef}
						initial={{ opacity: 0, y: 20, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.97 }}
						transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
						className="modal-panel text-left"
					>
						{/* Close Button */}
						<button
							type="button"
							onClick={onClose}
							className="modal-close"
							aria-label="Close modal"
						>
							<X size={16} className="stroke-[2.5]" />
						</button>

						{success ? (
							/* Success State Card View */
							<div className="flex flex-col items-center justify-center text-center py-8 select-none">
								<CheckCircle2
									size={48}
									className="text-green-500 stroke-[1.5] mb-4 animate-bounce"
								/>
								<h3 className="text-[20px] font-bold text-primary mb-2">
									{t.contactModal.title.includes("saber")
										? "¡Mensaje Enviado!"
										: "Message Sent!"}
								</h3>
								<p className="text-[13px] text-secondary leading-relaxed max-w-[320px]">
									{t.contactModal.successMessage}
								</p>
								<button
									type="button"
									onClick={onClose}
									className="mt-6 font-mono text-[11px] font-semibold border border-[var(--border-default)] rounded-lg px-4 py-2 hover:bg-[var(--bg-subtle)] text-secondary hover:text-primary transition-colors cursor-pointer"
								>
									{t.contactModal.title.includes("saber") ? "Cerrar" : "Close"}
								</button>
							</div>
						) : (
							/* Interactive Form View */
							<form onSubmit={handleSubmit} className="flex flex-col gap-4">
								{/* Title block */}
								<div className="select-none">
									<h3 className="modal-title">{t.contactModal.title}</h3>
									<p className="modal-subtitle">{t.contactModal.subtitle}</p>
								</div>

								{/* Radio motive options */}
								<div className="flex flex-col gap-1 border-y border-[var(--border-default)] py-3">
									{t.contactModal.reasons.map((optText) => {
										const isActive = reason === optText;
										return (
											/* biome-ignore lint/a11y/noStaticElementInteractions: click wrapper for custom radio layout */
											/* biome-ignore lint/a11y/useKeyWithClickEvents: mouse selection option */
											<div
												key={optText}
												onClick={() => setReason(optText)}
												className="radio-option"
											>
												<div
													className={`radio-circle ${
														isActive ? "radio-circle--active" : ""
													}`}
												/>
												<span>{optText}</span>
											</div>
										);
									})}
								</div>

								{/* Email Address */}
								<div className="flex flex-col gap-1">
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										onBlur={(e) => validateEmail(e.target.value)}
										placeholder={t.contactModal.emailPlaceholder}
										required
										disabled={loading}
										className="modal-input"
									/>
									{emailError && (
										<span className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-0.5 select-none">
											<AlertCircle size={10} />
											{emailError}
										</span>
									)}
								</div>

								{/* Message Body */}
								<div className="flex flex-col gap-1">
									<textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										onBlur={(e) => validateMessage(e.target.value)}
										placeholder={t.contactModal.messagePlaceholder}
										required
										disabled={loading}
										className="modal-textarea"
									/>
									<div className="flex justify-between items-center mt-0.5 select-none text-[10px]">
										{messageError ? (
											<span className="font-medium text-red-500 flex items-center gap-1">
												<AlertCircle size={10} />
												{messageError}
											</span>
										) : (
											<span className="text-secondary" />
										)}
										<span
											className={`font-mono ${message.length > 500 ? "text-red-500" : "text-secondary"}`}
										>
											{message.length}/500
										</span>
									</div>
								</div>

								{/* Error Banner if API fails */}
								{submitError && (
									<div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[11px] text-red-400 flex items-center gap-2 select-none">
										<AlertCircle size={12} className="shrink-0" />
										<span>{submitError}</span>
									</div>
								)}

								{/* Submit button */}
								<button
									type="submit"
									disabled={
										loading ||
										!reason ||
										!email ||
										!message ||
										message.length < 10 ||
										message.length > 500
									}
									className="modal-submit select-none font-semibold cursor-pointer"
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-white/30 border-t-white" />
											<span>{t.contactModal.submittingButton}</span>
										</>
									) : (
										<>
											<span>{t.contactModal.submitButton}</span>
											<Send size={13} className="stroke-[2.5]" />
										</>
									)}
								</button>
							</form>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
