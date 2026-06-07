import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const contactReasons = ["Oferta de trabajo", "Colaboración", "Otro"] as const;

const ContactRequestSchema = z.object({
	name: z.string().trim().min(2).max(80),
	reason: z.enum(contactReasons),
	email: z.string().trim().email(),
	message: z.string().trim().min(10).max(500),
	website: z.string().max(0),
});

const resendApiKey = process.env.RESEND_API_KEY;
const contactFromEmail = process.env.CONTACT_FROM_EMAIL;
const contactToEmail = process.env.CONTACT_TO_EMAIL;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 3;

const requestLog = new Map<string, number[]>();

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

const getClientIdentifier = (req: VercelRequest) => {
	const forwardedFor = req.headers["x-forwarded-for"];
	if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
		return forwardedFor.split(",")[0]?.trim() || "unknown";
	}

	if (Array.isArray(forwardedFor) && forwardedFor[0]) {
		return forwardedFor[0];
	}

	return req.socket.remoteAddress || "unknown";
};

const isRateLimited = (identifier: string) => {
	const now = Date.now();
	const attempts = requestLog.get(identifier) ?? [];
	const recentAttempts = attempts.filter(
		(timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
	);

	if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
		requestLog.set(identifier, recentAttempts);
		return true;
	}

	recentAttempts.push(now);
	requestLog.set(identifier, recentAttempts);
	return false;
};

const buildEmailHtml = ({
	name,
	email,
	reason,
	message,
}: {
	name: string;
	email: string;
	reason: string;
	message: string;
}) => {
	const submittedAt = new Date().toLocaleString("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	});

	return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nuevo mensaje de contacto</title>
  </head>
  <body style="margin:0;padding:0;background:#08090a;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f0f0f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#08090a;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:separate;border-spacing:0 12px;">
            <tr>
              <td style="border:1px solid rgba(43,69,136,0.45);border-radius:16px;background:linear-gradient(135deg, rgba(43,69,136,0.28) 0%, #0f1012 90%);padding:20px 24px;">
                <div style="font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:#8ea3c6;font-family:'Geist Mono','SFMono-Regular',Consolas,monospace;">Portfolio Contact</div>
                <div style="margin-top:10px;font-size:26px;line-height:32px;font-weight:700;color:#f0f0f0;">Nuevo mensaje recibido</div>
                <div style="margin-top:8px;font-size:14px;line-height:22px;color:#a6adb8;">Un visitante envió un mensaje desde el formulario de contacto del portafolio.</div>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:#0f1012;padding:18px 20px;">
                <div style="font-size:11px;line-height:16px;letter-spacing:0.14em;text-transform:uppercase;color:#6f7785;font-family:'Geist Mono','SFMono-Regular',Consolas,monospace;">Remitente</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                  <tr>
                    <td style="padding:0 0 10px 0;">
                      <div style="font-size:12px;line-height:16px;color:#7e8695;font-family:'Geist Mono','SFMono-Regular',Consolas,monospace;">Nombre</div>
                      <div style="margin-top:4px;font-size:15px;line-height:22px;color:#f0f0f0;font-weight:600;">${escapeHtml(name)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 10px 0;">
                      <div style="font-size:12px;line-height:16px;color:#7e8695;font-family:'Geist Mono','SFMono-Regular',Consolas,monospace;">Correo</div>
                      <div style="margin-top:4px;font-size:15px;line-height:22px;color:#c4d5ff;">${escapeHtml(email)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style="font-size:12px;line-height:16px;color:#7e8695;font-family:'Geist Mono','SFMono-Regular',Consolas,monospace;">Motivo</div>
                      <div style="margin-top:4px;font-size:15px;line-height:22px;color:#f0f0f0;">${escapeHtml(reason)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:#0f1012;padding:18px 20px;">
                <div style="font-size:11px;line-height:16px;letter-spacing:0.14em;text-transform:uppercase;color:#6f7785;font-family:'Geist Mono','SFMono-Regular',Consolas,monospace;">Mensaje</div>
                <div style="margin-top:12px;font-size:15px;line-height:24px;color:#f0f0f0;white-space:pre-wrap;">${escapeHtml(message)}</div>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:#0f1012;padding:16px 20px;">
                <div style="font-size:11px;line-height:16px;letter-spacing:0.14em;text-transform:uppercase;color:#6f7785;font-family:'Geist Mono','SFMono-Regular',Consolas,monospace;">Meta</div>
                <div style="margin-top:10px;font-size:13px;line-height:20px;color:#9aa3b2;">Enviado desde el formulario del portafolio</div>
                <div style="margin-top:4px;font-size:13px;line-height:20px;color:#9aa3b2;">${escapeHtml(submittedAt)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

const buildEmailText = ({
	name,
	email,
	reason,
	message,
}: {
	name: string;
	email: string;
	reason: string;
	message: string;
}) => `Has recibido un nuevo mensaje desde tu portafolio web.

Nombre: ${name}
Correo: ${email}
Motivo: ${reason}

Mensaje:
${message}
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST") {
		res.setHeader("Allow", ["POST"]);
		return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
	}

	if (!resendApiKey || !contactFromEmail || !contactToEmail) {
		console.error("Missing contact email environment configuration");
		return res.status(500).json({ error: "Email service configuration error" });
	}

	const clientIdentifier = getClientIdentifier(req);
	if (isRateLimited(clientIdentifier)) {
		return res.status(429).json({
			error: "Too many contact attempts. Please try again in a minute.",
		});
	}

	try {
		const body = ContactRequestSchema.parse(req.body);

		if (body.website) {
			return res.status(200).json({ success: true });
		}

		const resend = new Resend(resendApiKey);
		const { data, error } = await resend.emails.send({
			from: contactFromEmail,
			to: contactToEmail,
			replyTo: body.email,
			subject: `[Portfolio] ${body.reason} - ${body.name}`,
			text: buildEmailText(body),
			html: buildEmailHtml(body),
		});

		if (error) {
			console.error("Resend API error:", error);
			return res.status(400).json({ error: error.message });
		}

		return res.status(200).json({ success: true, id: data?.id });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: "Invalid request payload",
				details: error.issues,
			});
		}

		console.error("Unhandled handler error:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
}

export const config = {
	api: {
		bodyParser: true,
	},
};
