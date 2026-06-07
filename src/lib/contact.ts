export interface ContactData {
	name: string;
	reason: string;
	email: string;
	message: string;
	website: string;
}

export const sendContactMessage = async (
	data: ContactData,
): Promise<{ success: boolean; error?: string }> => {
	try {
		const response = await fetch("/api/contact", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				error: errorData.error || `HTTP error ${response.status}`,
			};
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Network error",
		};
	}
};
