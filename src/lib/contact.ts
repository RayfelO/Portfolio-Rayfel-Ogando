export interface ContactData {
	name: string;
	reason: string;
	email: string;
	message: string;
	website: string;
}

const getNetworkError = (error: unknown): string =>
	error instanceof Error ? error.message : "Network error";

const getHttpError = async (response: Response): Promise<string> => {
	const body = await response.json().catch(() => ({}));
	return body.error || `HTTP error ${response.status}`;
};

export const sendContactMessage = async (
	data: ContactData,
): Promise<{ success: boolean; error?: string }> => {
	try {
		const response = await fetch("/api/contact", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			return { success: false, error: await getHttpError(response) };
		}

		return { success: true };
	} catch (error) {
		return { success: false, error: getNetworkError(error) };
	}
};
