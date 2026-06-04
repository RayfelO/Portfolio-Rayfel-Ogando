import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const ContactRequestSchema = z.object({
  reason: z.enum(["Oferta de trabajo", "Colaboración", "Otro"]),
  email: z.string().email(),
  message: z.string().min(10).max(500),
});

const resendApiKey = process.env.RESEND_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!resendApiKey) {
    console.error("Missing RESEND_API_KEY environment variable");
    return res.status(500).json({ error: "Email service configuration error" });
  }

  try {
    // Validate request body
    const body = ContactRequestSchema.parse(req.body);

    const resend = new Resend(resendApiKey);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>", // Resend onboarding sender by default
      to: "rayfelogando@gmail.com", // Destination email
      replyTo: body.email,
      subject: `[Portfolio] ${body.reason} — ${body.email}`,
      text: `Has recibido un nuevo mensaje desde tu portafolio web.
      
Motivo: ${body.reason}
De: ${body.email}

Mensaje:
${body.message}
`,
    });

    if (error) {
      console.error("Resend API error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request payload", details: error.errors });
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
