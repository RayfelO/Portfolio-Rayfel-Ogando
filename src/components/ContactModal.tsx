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

type ContactField = "name" | "reason" | "email" | "message";

const isSpanishContactCopy = (t: Translations) =>
	t.contactModal.submitButton === "Enviar mensaje";

const getContactErrorCopy = (
	field: ContactField,
	t: Translations,
	context?: "format" | "length",
) => {
	const isSpanish = isSpanishContactCopy(t);

	if (isSpanish) {
		switch (field) {
			case "name":
				return context === "length"
					? "Usa un nombre de hasta 80 caracteres."
					: "Cu\u00e9ntame c\u00f3mo te llamas.";
			case "reason":
				return "Selecciona el motivo de tu mensaje.";
			case "email":
				return context === "format"
					? "Escribe un correo electr\u00f3nico v\u00e1lido."
					: "Necesito tu correo para responderte.";
			case "message":
				if (context === "length") {
					return "Tu mensaje debe tener entre 10 y 500 caracteres.";
				}
				return "Cu\u00e9ntame un poco m\u00e1s para poder ayudarte.";
		}
	}

	switch (field) {
		case "name":
			return context === "length"
				? "Use a name with 80 characters or fewer."
				: "Tell me your name.";
		case "reason":
			return "Choose what this message is about.";
		case "email":
			return context === "format"
				? "Enter a valid email address."
				: "I need your email to reply.";
		case "message":
			if (context === "length") {
				return "Your message must be between 10 and 500 characters.";
			}
			return "Share a bit more so I can help.";
	}
};

const getMessagePrefill = (reason: string, t: Translations) => {
	const isSpanish = isSpanishContactCopy(t);

	if (isSpanish) {
		if (reason === "Oferta de trabajo") {
			return "Hola Rayfel, me gustar\u00eda hablar contigo sobre una oportunidad laboral.";
		}

		if (reason === "Colaboraci\u00f3n") {
			return "Hola Rayfel, me gustar\u00eda explorar una posible colaboraci\u00f3n contigo.";
		}
	} else {
		if (reason === "Job offer") {
			return "Hi Rayfel, I'd like to talk with you about a job opportunity.";
		}

		if (reason === "Collaboration") {
			return "Hi Rayfel, I'd like to explore a possible collaboration with you.";
		}
	}

	return "";
};

const getTemplateMessages = (t: Translations): string[] => {
	return t.contactModal.reasons
		.map((reason) => getMessagePrefill(reason, t))
		.filter((value) => value.length > 0);
};

export const ContactModal: React.FC<ContactModalProps> = ({
	isOpen,
	onClose,
	t,
}) => {
	const [reason, setReason] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [website, setWebsite] = useState("");

	const [reasonError, setReasonError] = useState<string | null>(null);
	const [nameError, setNameError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);
	const [messageError, setMessageError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const defaultReason = t.contactModal.reasons[2] ?? null;

	const panelRef = useRef<HTMLDivElement>(null);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const emailInputRef = useRef<HTMLInputElement>(null);
	const messageInputRef = useRef<HTMLTextAreaElement>(null);
	const reasonGroupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			setReason(defaultReason);
			setName("");
			setEmail("");
			setMessage("");
			setWebsite("");
			setReasonError(null);
			setNameError(null);
			setEmailError(null);
			setMessageError(null);
			setSubmitError(null);
			setSuccess(false);
			setLoading(false);
		}

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [defaultReason, isOpen, onClose]);

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
			onClose();
		}
	};

	const validateReason = (value: string | null) => {
		if (!value) {
			setReasonError(getContactErrorCopy("reason", t));
			return false;
		}

		setReasonError(null);
		return true;
	};

	const validateName = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue.length < 2) {
			setNameError(getContactErrorCopy("name", t));
			return false;
		}

		if (trimmedValue.length > 80) {
			setNameError(getContactErrorCopy("name", t, "length"));
			return false;
		}

		setNameError(null);
		return true;
	};

	const validateEmail = (value: string) => {
		if (!value.trim()) {
			setEmailError(getContactErrorCopy("email", t));
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value)) {
			setEmailError(getContactErrorCopy("email", t, "format"));
			return false;
		}

		setEmailError(null);
		return true;
	};

	const validateMessage = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue.length < 10 || trimmedValue.length > 500) {
			setMessageError(getContactErrorCopy("message", t, "length"));
			return false;
		}

		setMessageError(null);
		return true;
	};

	const handleReasonSelect = (nextReason: string) => {
		const trimmedMessage = message.trim();
		const isCurrentTemplate = getTemplateMessages(t).includes(trimmedMessage);

		setReason(nextReason);
		setReasonError(null);

		if (trimmedMessage && !isCurrentTemplate) {
			return;
		}

		const prefill = getMessagePrefill(nextReason, t);
		if (prefill) {
			setMessage(prefill);
			setMessageError(null);
			return;
		}

		if (isCurrentTemplate) {
			setMessage("");
			setMessageError(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		const isReasonValid = validateReason(reason);
		const isNameValid = validateName(name);
		const isEmailValid = validateEmail(email);
		const isMessageValid = validateMessage(message);

		if (!isReasonValid) track.contactFormError("reason");
		if (!isNameValid) track.contactFormError("name");
		if (!isEmailValid) track.contactFormError("email");
		if (!isMessageValid) track.contactFormError("message");

		if (!isReasonValid || !isNameValid || !isEmailValid || !isMessageValid) {
			if (!isReasonValid) {
				reasonGroupRef.current?.focus();
			} else if (!isNameValid) {
				nameInputRef.current?.focus();
			} else if (!isEmailValid) {
				emailInputRef.current?.focus();
			} else {
				messageInputRef.current?.focus();
			}
			return;
		}

		setLoading(true);
		const selectedReason = reason ?? "";

		const result = await sendContactMessage({
			name: name.trim(),
			reason: selectedReason,
			email: email.trim(),
			message: message.trim(),
			website,
		});

		setLoading(false);

		if (result.success) {
			setSuccess(true);
			track.contactFormSubmitted(selectedReason);
			return;
		}

		setSubmitError(result.error || t.contactModal.errorMessage);
		track.contactFormError("submit_failed");
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
					<motion.div
						ref={panelRef}
						initial={{ opacity: 0, y: 20, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.97 }}
						transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
						data-lenis-prevent
						className="modal-panel text-left"
					>
						<button
							type="button"
							onClick={onClose}
							className="modal-close"
							aria-label="Close modal"
						>
							<X size={16} className="stroke-[2.5]" />
						</button>

						{success ? (
							<div className="flex flex-col items-center justify-center text-center py-8 select-none">
								<motion.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{ type: "spring", stiffness: 300, damping: 15 }}
								>
									<CheckCircle2
										size={48}
										className="text-[var(--status-green)] stroke-[1.5] mb-4"
									/>
								</motion.div>
								<h3 className="text-[20px] font-bold text-primary mb-2">
									{isSpanishContactCopy(t)
										? "\u00a1Mensaje enviado!"
										: "Message sent!"}
								</h3>
								<p className="text-[13px] text-secondary leading-relaxed max-w-[320px]">
									{t.contactModal.successMessage}
								</p>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									type="button"
									onClick={onClose}
									className="mt-6 font-mono text-[11px] font-semibold border border-[var(--border-default)] rounded-lg px-4 py-2 hover:bg-[var(--bg-subtle)] text-secondary hover:text-primary transition-colors cursor-pointer"
								>
									{isSpanishContactCopy(t) ? "Cerrar" : "Close"}
								</motion.button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="flex flex-col gap-4">
								<div className="select-none">
									<h3 className="modal-title">{t.contactModal.title}</h3>
									<p className="modal-subtitle">{t.contactModal.subtitle}</p>
								</div>

								<div className="flex flex-col gap-2 border-y border-[var(--border-default)] py-3">
									<div className="flex items-center justify-between text-[11px] text-secondary select-none">
										<span className="font-mono uppercase tracking-[0.16em]">
											{isSpanishContactCopy(t)
												? "Motivo del mensaje"
												: "Message reason"}
										</span>
									</div>
									<div
										ref={reasonGroupRef}
										tabIndex={-1}
										className="grid gap-2 sm:grid-cols-3 outline-none"
									>
										{t.contactModal.reasons.map((optText) => {
											const isActive = reason === optText;
											return (
												<button
													key={optText}
													type="button"
													onClick={() => handleReasonSelect(optText)}
													onKeyDown={(event) => {
														if (event.key === "Enter" || event.key === " ") {
															event.preventDefault();
															handleReasonSelect(optText);
														}
													}}
													className={`flex items-center justify-center text-center rounded-xl border px-3 py-2 text-[12px] sm:text-[13px] font-medium transition-colors ${
														isActive
															? "border-[var(--accent-text)] bg-[var(--accent-bg)] text-primary"
															: "border-[var(--border-default)] bg-transparent text-secondary hover:bg-[var(--bg-subtle)] hover:text-primary"
													} ${reasonError ? "border-red-500/40" : ""} text-center`}
													aria-pressed={isActive}
												>
													{optText}
												</button>
											);
										})}
									</div>
									<AnimatePresence>
										{reasonError && (
											<motion.span
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												transition={{ duration: 0.15 }}
												className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1 select-none"
											>
												<AlertCircle size={10} />
												{reasonError}
											</motion.span>
										)}
									</AnimatePresence>
								</div>

								<div className="flex flex-col gap-1">
									<input
										ref={nameInputRef}
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										onBlur={(e) => validateName(e.target.value)}
										placeholder={t.contactModal.namePlaceholder}
										required
										disabled={loading}
										className="modal-input"
									/>
									<AnimatePresence>
										{nameError && (
											<motion.span
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												transition={{ duration: 0.15 }}
												className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-0.5 select-none"
											>
												<AlertCircle size={10} />
												{nameError}
											</motion.span>
										)}
									</AnimatePresence>
								</div>

								<div className="flex flex-col gap-1">
									<input
										ref={emailInputRef}
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										onBlur={(e) => validateEmail(e.target.value)}
										placeholder={t.contactModal.emailPlaceholder}
										required
										disabled={loading}
										className="modal-input"
									/>
									<AnimatePresence>
										{emailError && (
											<motion.span
												initial={{ opacity: 0, y: -5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												transition={{ duration: 0.15 }}
												className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-0.5 select-none"
											>
												<AlertCircle size={10} />
												{emailError}
											</motion.span>
										)}
									</AnimatePresence>
								</div>

								<div className="flex flex-col gap-1">
									<textarea
										ref={messageInputRef}
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										onBlur={(e) => validateMessage(e.target.value)}
										placeholder={t.contactModal.messagePlaceholder}
										required
										disabled={loading}
										className="modal-textarea min-h-[120px] sm:min-h-[120px]"
									/>
									<div className="flex justify-between items-center mt-0.5 select-none text-[10px] min-h-[16px]">
										<AnimatePresence mode="wait">
											{messageError ? (
												<motion.span
													key="msgError"
													initial={{ opacity: 0, y: -3 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -3 }}
													transition={{ duration: 0.12 }}
													className="font-medium text-red-500 flex items-center gap-1"
												>
													<AlertCircle size={10} />
													{messageError}
												</motion.span>
											) : (
												<span key="msgHint" className="text-secondary">
													{isSpanishContactCopy(t)
														? "M\u00ednimo 10 caracteres."
														: "Minimum 10 characters."}
												</span>
											)}
										</AnimatePresence>
										<span
											className={`font-mono ${message.length > 500 ? "text-red-500" : "text-secondary"}`}
										>
											{message.length}/500
										</span>
									</div>
								</div>

								<div className="hidden" aria-hidden="true">
									<label htmlFor="contact-website" className="sr-only">
										Website
									</label>
									<input
										id="contact-website"
										type="text"
										tabIndex={-1}
										autoComplete="off"
										value={website}
										onChange={(e) => setWebsite(e.target.value)}
										className="hidden"
									/>
								</div>

								{submitError && (
									<div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[11px] text-red-400 flex items-center gap-2 select-none">
										<AlertCircle size={12} className="shrink-0" />
										<span>{submitError}</span>
									</div>
								)}

								<motion.button
									whileHover={loading ? {} : { scale: 1.02 }}
									whileTap={loading ? {} : { scale: 0.98 }}
									transition={{ type: "spring", stiffness: 450, damping: 20 }}
									type="submit"
									disabled={loading}
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
								</motion.button>
							</form>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
