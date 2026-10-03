import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RECIPIENT = "myksaconnect@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const businessName = String(body.businessName ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const email = String(body.email ?? "").trim();
    const city = String(body.city ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    if (!businessName || !contactName || !phone) {
      return NextResponse.json(
        { error: "Business name, contact person, and phone number are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("menu-request: RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email sending isn't configured yet. Please contact us directly." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      // Resend's shared test domain — works out of the box with no DNS setup,
      // but can only deliver to the email the Resend account itself was
      // created with (myksaconnect@gmail.com), which is exactly our recipient.
      from: "MYKSA CONNECT <onboarding@resend.dev>",
      to: RECIPIENT,
      replyTo: email || undefined,
      subject: `New Digital Menu Request — ${businessName}`,
      text: [
        "New digital menu request from MYKSA CONNECT (/restaurants/create)",
        "",
        `Business Name: ${businessName}`,
        `Contact Person: ${contactName}`,
        `Phone: ${phone}`,
        `WhatsApp: ${whatsapp || phone}`,
        `Email: ${email || "Not provided"}`,
        `City: ${city || "Not provided"}`,
        "",
        "Notes:",
        notes || "—",
      ].join("\n"),
    });

    if (error) {
      console.error("menu-request resend error:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("menu-request error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
