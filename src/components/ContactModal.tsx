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

const errorMessages: Record<string, Record<string, Record<string, string>>> = {
	es: {
		name: {
			default: "Cu\u00e9ntame c\u00f3mo te llamas.",
			length: "Usa un nombre de hasta 80 caracteres.",
		},
		reason: { default: "Selecciona el motivo de tu mensaje." },
		email: {
			default: "Necesito tu correo para responderte.",
			format: "Escribe un correo electr\u00f3nico v\u00e1lido.",
		},
		message: {
			default: "Cu\u00e9ntame un poco m\u00e1s para poder ayudarte.",
			length: "Tu mensaje debe tener entre 10 y 500 caracteres.",
		},
	},
	en: {
		name: {
			default: "Tell me your name.",
			length: "Use a name with 80 characters or fewer.",
		},
		reason: { default: "Choose what this message is about." },
		email: {
			default: "I need your email to reply.",
			format: "Enter a valid email address.",
		},
		message: {
			default: "Share a bit more so I can help.",
			length: "Your message must be between 10 and 500 characters.",
		},
	},
};

const getContactErrorCopy = (
	field: ContactField,
	t: Translations,
	context: string = "default",
) => {
	const lang = isSpanishContactCopy(t) ? "es" : "en";
	const fieldMessages = errorMessages[lang][field];
	return fieldMessages?.[context] || "";
};

const prefillMessages: Record<string, Record<string, string>> = {
	es: {
		"Oferta de trabajo":
			"Hola Rayfel, me gustar\u00eda hablar contigo sobre una oportunidad laboral.",
		"Colaboraci\u00f3n":
			"Hola Rayfel, me gustar\u00eda explorar una posible colaboraci\u00f3n contigo.",
	},
	en: {
		"Job offer":
			"Hi Rayfel, I'd like to talk with you about a job opportunity.",
		Collaboration:
			"Hi Rayfel, I'd like to explore a possible collaboration with you.",
	},
};

const getMessagePrefill = (reason: string, t: Translations) => {
	const lang = isSpanishContactCopy(t) ? "es" : "en";
	return prefillMessages[lang]?.[reason] ?? "";
};

const getTemplateMessages = (t: Translations): string[] => {
	return t.contactModal.reasons
		.map((reason) => getMessagePrefill(reason, t))
		.filter((value) => value.length > 0);
};

const FormFieldError: React.FC<{
	error: string | null;
	className?: string;
}> = ({ error, className = "mt-0.5" }) => (
	<AnimatePresence>
		{error && (
			<motion.span
				initial={{ opacity: 0, y: -5 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -5 }}
				transition={{ duration: 0.15 }}
				className={`text-[11px] font-medium text-red-500 flex items-center gap-1 ${className} select-none`}
			>
				<AlertCircle size={10} />
				{error}
			</motion.span>
		)}
	</AnimatePresence>
);

const SuccessView: React.FC<{ t: Translations; onClose: () => void }> = ({
	t,
	onClose,
}) => (
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
			{isSpanishContactCopy(t) ? "\u00a1Mensaje enviado!" : "Message sent!"}
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
);

/* ---- extracted helpers ---- */

const validateReasonField = (
	value: string | null,
	t: Translations,
): string | null => {
	return !value ? getContactErrorCopy("reason", t) : null;
};

const validateNameField = (name: string, t: Translations): string | null => {
	const trimmed = name.trim();
	if (trimmed.length < 2) return getContactErrorCopy("name", t);
	if (trimmed.length > 80) return getContactErrorCopy("name", t, "length");
	return null;
};

const validateEmailField = (email: string, t: Translations): string | null => {
	const trimmed = email.trim();
	if (!trimmed) return getContactErrorCopy("email", t);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
		return getContactErrorCopy("email", t, "format");
	return null;
};

const validateMessageField = (
	message: string,
	t: Translations,
): string | null => {
	const trimmed = message.trim();
	if (trimmed.length < 10 || trimmed.length > 500)
		return getContactErrorCopy("message", t, "length");
	return null;
};

const validateForm = (
	reason: string | null,
	name: string,
	email: string,
	message: string,
	t: Translations,
): {
	isValid: boolean;
	firstInvalidField: ContactField | null;
	errors: Record<ContactField, string | null>;
} => {
	const errors: Record<ContactField, string | null> = {
		reason: validateReasonField(reason, t),
		name: validateNameField(name, t),
		email: validateEmailField(email, t),
		message: validateMessageField(message, t),
	};

	const firstInvalidField = (
		["reason", "name", "email", "message"] as const
	).find((f) => errors[f] !== null) as ContactField | null;

	return { isValid: firstInvalidField === null, firstInvalidField, errors };
};

const INIT = {
	reason: null as string | null,
	name: "",
	email: "",
	message: "",
	website: "",
	reasonError: null as string | null,
	nameError: null as string | null,
	emailError: null as string | null,
	messageError: null as string | null,
	submitError: null as string | null,
	loading: false,
	success: false,
};

const useContactFormReset = (
	isOpen: boolean,
	defaultReason: string | null,
	onClose: () => void,
) => {
	const [s, setS] = useState(INIT);
	const set = <K extends keyof typeof INIT>(k: K, v: (typeof INIT)[K]) =>
		setS((p) => ({ ...p, [k]: v }));
	useEffect(() => {
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (!isOpen) return;
		window.addEventListener("keydown", onEsc);
		setS({ ...INIT, reason: defaultReason });
		return () => window.removeEventListener("keydown", onEsc);
	}, [defaultReason, isOpen, onClose]);
	return {
		reason: s.reason,
		setReason: (v: string | null) => set("reason", v),
		name: s.name,
		setName: (v: string) => set("name", v),
		email: s.email,
		setEmail: (v: string) => set("email", v),
		message: s.message,
		setMessage: (v: string) => set("message", v),
		website: s.website,
		setWebsite: (v: string) => set("website", v),
		reasonError: s.reasonError,
		setReasonError: (v: string | null) => set("reasonError", v),
		nameError: s.nameError,
		setNameError: (v: string | null) => set("nameError", v),
		emailError: s.emailError,
		setEmailError: (v: string | null) => set("emailError", v),
		messageError: s.messageError,
		setMessageError: (v: string | null) => set("messageError", v),
		submitError: s.submitError,
		setSubmitError: (v: string | null) => set("submitError", v),
		loading: s.loading,
		setLoading: (v: boolean) => set("loading", v),
		success: s.success,
		setSuccess: (v: boolean) => set("success", v),
	};
};

const ReasonSelector: React.FC<{
	reasons: readonly string[];
	reason: string | null;
	reasonError: string | null;
	reasonGroupRef: React.RefObject<HTMLDivElement | null>;
	onReasonSelect: (reason: string) => void;
}> = ({ reasons, reason, reasonError, reasonGroupRef, onReasonSelect }) => (
	<div
		ref={reasonGroupRef}
		tabIndex={-1}
		className="grid gap-2 sm:grid-cols-3 outline-none"
	>
		{reasons.map((optText) => {
			const isActive = reason === optText;
			return (
				<button
					key={optText}
					type="button"
					onClick={() => onReasonSelect(optText)}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							onReasonSelect(optText);
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
);

const CharCounter: React.FC<{ current: number; max: number }> = ({
	current,
	max,
}) => (
	<span
		className={`font-mono ${current > max ? "text-red-500" : "text-secondary"}`}
	>
		{current}/{max}
	</span>
);

const ReasonLabel: React.FC<{ t: Translations }> = ({ t }) => (
	<span className="font-mono uppercase tracking-[0.16em]">
		{isSpanishContactCopy(t) ? "Motivo del mensaje" : "Message reason"}
	</span>
);

const MessageArea: React.FC<{
	message: string;
	messageError: string | null;
	t: Translations;
}> = ({ message, messageError, t }) => (
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
		<CharCounter current={message.length} max={500} />
	</div>
);

const SubmitButton: React.FC<{
	loading: boolean;
	t: Translations;
}> = ({ loading, t }) => (
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
);

/* ---- sub-components ---- */

const FormHeader: React.FC<{ t: Translations }> = ({ t }) => (
	<div className="select-none">
		<h3 className="modal-title">{t.contactModal.title}</h3>
		<p className="modal-subtitle">{t.contactModal.subtitle}</p>
	</div>
);

const FormInput: React.FC<{
	inputRef: React.RefObject<HTMLInputElement | null>;
	value: string;
	onChange: (v: string) => void;
	onBlur: (v: string) => void;
	placeholder: string;
	error: string | null;
	disabled?: boolean;
	type?: string;
}> = ({
	inputRef,
	value,
	onChange,
	onBlur,
	placeholder,
	error,
	disabled,
	type = "text",
}) => (
	<div className="flex flex-col gap-1">
		<input
			ref={inputRef}
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onBlur={(e) => onBlur(e.target.value)}
			placeholder={placeholder}
			required
			disabled={disabled}
			className="modal-input"
		/>
		<FormFieldError error={error} />
	</div>
);

const FormMessage: React.FC<{
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	value: string;
	onChange: (v: string) => void;
	onBlur: (v: string) => void;
	placeholder: string;
	error: string | null;
	t: Translations;
	disabled?: boolean;
}> = ({
	textareaRef,
	value,
	onChange,
	onBlur,
	placeholder,
	error,
	t,
	disabled,
}) => (
	<div className="flex flex-col gap-1">
		<textarea
			ref={textareaRef}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onBlur={(e) => onBlur(e.target.value)}
			placeholder={placeholder}
			required
			disabled={disabled}
			className="modal-textarea min-h-[120px] sm:min-h-[120px]"
		/>
		<MessageArea message={value} messageError={error} t={t} />
	</div>
);

const HoneypotField: React.FC<{
	value: string;
	onChange: (v: string) => void;
}> = ({ value, onChange }) => (
	<div className="hidden" aria-hidden="true">
		<label htmlFor="contact-website" className="sr-only">
			Website
		</label>
		<input
			id="contact-website"
			type="text"
			tabIndex={-1}
			autoComplete="off"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="hidden"
		/>
	</div>
);

const SubmitErrorBlock: React.FC<{ error: string | null }> = ({ error }) =>
	error ? (
		<div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-[11px] text-red-400 flex items-center gap-2 select-none">
			<AlertCircle size={12} className="shrink-0" />
			<span>{error}</span>
		</div>
	) : null;

/* ---- sub-components ---- */

const ReasonSection: React.FC<{
	t: Translations;
	reason: string | null;
	reasonError: string | null;
	reasonGroupRef: React.RefObject<HTMLDivElement | null>;
	onReasonSelect: (reason: string) => void;
}> = ({ t, reason, reasonError, reasonGroupRef, onReasonSelect }) => (
	<div className="flex flex-col gap-2 border-y border-[var(--border-default)] py-3">
		<div className="flex items-center justify-between text-[11px] text-secondary select-none">
			<ReasonLabel t={t} />
		</div>
		<ReasonSelector
			reasons={t.contactModal.reasons}
			reason={reason}
			reasonError={reasonError}
			reasonGroupRef={reasonGroupRef}
			onReasonSelect={onReasonSelect}
		/>
		<FormFieldError error={reasonError} className="mt-1" />
	</div>
);

/* ---- ContactForm ---- */

type FormRefs = {
	nameInputRef: React.RefObject<HTMLInputElement | null>;
	emailInputRef: React.RefObject<HTMLInputElement | null>;
	messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
	reasonGroupRef: React.RefObject<HTMLDivElement | null>;
};

const ContactForm: React.FC<{
	t: Translations;
	f: ReturnType<typeof useContactFormReset>;
	r: FormRefs;
	h: ReturnType<typeof useContactFormHandlers>;
}> = ({ t, f, r, h }) => {
	const nf = {
		inputRef: r.nameInputRef,
		value: f.name,
		onChange: f.setName,
		onBlur: h.validateName,
		placeholder: t.contactModal.namePlaceholder,
		error: f.nameError,
		disabled: f.loading,
	};
	const ef = {
		inputRef: r.emailInputRef,
		value: f.email,
		onChange: f.setEmail,
		onBlur: h.validateEmail,
		placeholder: t.contactModal.emailPlaceholder,
		error: f.emailError,
		disabled: f.loading,
		type: "email" as const,
	};
	const mf = {
		textareaRef: r.messageInputRef,
		value: f.message,
		onChange: f.setMessage,
		onBlur: h.validateMessage,
		placeholder: t.contactModal.messagePlaceholder,
		error: f.messageError,
		t,
		disabled: f.loading,
	};
	return (
		<form onSubmit={h.handleSubmit} className="flex flex-col gap-4">
			<FormHeader t={t} />
			<ReasonSection
				t={t}
				reason={f.reason}
				reasonError={f.reasonError}
				reasonGroupRef={r.reasonGroupRef}
				onReasonSelect={h.handleReasonSelect}
			/>
			<FormInput {...nf} />
			<FormInput {...ef} />
			<FormMessage {...mf} />
			<HoneypotField value={f.website} onChange={f.setWebsite} />
			<SubmitErrorBlock error={f.submitError} />
			<SubmitButton loading={f.loading} t={t} />
		</form>
	);
};

/* ---- handlers hook ---- */

type HandlersRefs = {
	nameInputRef: React.RefObject<HTMLInputElement | null>;
	emailInputRef: React.RefObject<HTMLInputElement | null>;
	messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
	reasonGroupRef: React.RefObject<HTMLDivElement | null>;
};

const focusFirstInvalid = (r: HandlersRefs, field: ContactField) => {
	const map: Record<ContactField, React.RefObject<HTMLElement | null>> = {
		reason: r.reasonGroupRef as React.RefObject<HTMLElement | null>,
		name: r.nameInputRef as React.RefObject<HTMLElement | null>,
		email: r.emailInputRef as React.RefObject<HTMLElement | null>,
		message: r.messageInputRef as React.RefObject<HTMLElement | null>,
	};
	map[field].current?.focus();
};

const submitForm = async (
	f: ReturnType<typeof useContactFormReset>,
	selectedReason: string,
	t: Translations,
) => {
	f.setLoading(true);
	const result = await sendContactMessage({
		name: f.name.trim(),
		reason: selectedReason,
		email: f.email.trim(),
		message: f.message.trim(),
		website: f.website,
	});
	f.setLoading(false);
	if (result.success) {
		f.setSuccess(true);
		track.contactFormSubmitted(selectedReason);
		return;
	}
	f.setSubmitError(result.error || t.contactModal.errorMessage);
	track.contactFormError("submit_failed");
};

const useContactFormHandlers = (
	f: ReturnType<typeof useContactFormReset>,
	r: HandlersRefs,
	t: Translations,
) => {
	const validateName = (value: string) => {
		const e = validateNameField(value, t);
		f.setNameError(e);
		return e === null;
	};
	const validateEmail = (value: string) => {
		const e = validateEmailField(value, t);
		f.setEmailError(e);
		return e === null;
	};
	const validateMessage = (value: string) => {
		const e = validateMessageField(value, t);
		f.setMessageError(e);
		return e === null;
	};
	const handleReasonSelect = (nextReason: string) => {
		f.setReason(nextReason);
		f.setReasonError(null);
		const trimmed = f.message.trim();
		if (trimmed && !getTemplateMessages(t).includes(trimmed)) return;
		f.setMessage(getMessagePrefill(nextReason, t) || "");
		f.setMessageError(null);
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		f.setSubmitError(null);
		const v = validateForm(f.reason, f.name, f.email, f.message, t);
		f.setReasonError(v.errors.reason);
		f.setNameError(v.errors.name);
		f.setEmailError(v.errors.email);
		f.setMessageError(v.errors.message);
		if (!v.isValid) {
			const invalidField = v.firstInvalidField ?? "reason";
			track.contactFormError(invalidField);
			focusFirstInvalid(r, invalidField);
			return;
		}
		await submitForm(f, f.reason ?? "", t);
	};
	return {
		handleReasonSelect,
		handleSubmit,
		validateName,
		validateEmail,
		validateMessage,
	};
};

/* ---- ModalShell ---- */

const ModalShell: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
	const panelRef = useRef<HTMLDivElement>(null);
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					onClick={(e) => {
						if (
							panelRef.current &&
							!panelRef.current.contains(e.target as Node)
						)
							onClose();
					}}
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
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

/* ---- ContactModal ---- */

export const ContactModal: React.FC<ContactModalProps> = ({
	isOpen,
	onClose,
	t,
}) => {
	const defaultReason = t.contactModal.reasons[2] ?? null;
	const f = useContactFormReset(isOpen, defaultReason, onClose);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const emailInputRef = useRef<HTMLInputElement>(null);
	const messageInputRef = useRef<HTMLTextAreaElement>(null);
	const reasonGroupRef = useRef<HTMLDivElement>(null);
	const h = useContactFormHandlers(
		f,
		{ nameInputRef, emailInputRef, messageInputRef, reasonGroupRef },
		t,
	);

	return (
		<ModalShell isOpen={isOpen} onClose={onClose}>
			{f.success ? (
				<SuccessView t={t} onClose={onClose} />
			) : (
				<ContactForm
					t={t}
					f={f}
					r={{ nameInputRef, emailInputRef, messageInputRef, reasonGroupRef }}
					h={h}
				/>
			)}
		</ModalShell>
	);
};
