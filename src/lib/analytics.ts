import posthog from "posthog-js";

export const initAnalytics = () => {
	const token = import.meta.env.VITE_POSTHOG_KEY ?? "phc_placeholder";
	posthog.init(token, {
		api_host: "https://app.posthog.com",
		capture_pageview: true,
		autocapture: false,
	});
};

// Captures page analytics
export const track = {
	portfolioViewed: () => posthog.capture("portfolio_viewed"),
	projectClicked: (name: string) =>
		posthog.capture("project_clicked", { name }),
	contactClicked: (platform: string) =>
		posthog.capture("contact_clicked", { platform }),
	languageChanged: (to: "en" | "es") =>
		posthog.capture("language_changed", { to }),
	themeChanged: (to: "dark" | "light") =>
		posthog.capture("theme_changed", { to }),
	contactModalOpened: () => posthog.capture("contact_modal_opened"),
	contactFormSubmitted: (reason: string) =>
		posthog.capture("contact_form_submitted", { reason }),
	contactFormError: (field: string) =>
		posthog.capture("contact_form_error", { field }),
};
