import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth";

interface IntakePayload {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  dob: string;
  zip: string;
  state?: string;
  annual_household_income: string;
  has_major_medical: "yes" | "no";
  current_coverage_type?: "aca" | "employer" | "private" | "none";
  household_size?: number;
  sms_consent: boolean;
  form_consent_source?: string;
  form_consent_timestamp?: string;
}

function validatePayload(body: any): { valid: boolean; error?: string } {
  if (!body.first_name?.trim()) return { valid: false, error: "First name is required" };
  if (!body.last_name?.trim()) return { valid: false, error: "Last name is required" };

  const phone = (body.phone || "").replace(/\D/g, "");
  if (phone.length !== 10) return { valid: false, error: "Phone must be a 10-digit US number" };

  if (body.email && (typeof body.email !== "string" || !body.email.includes("@"))) {
    return { valid: false, error: "Invalid email address" };
  }

  if (!body.dob || !/^\d{4}-\d{2}-\d{2}$/.test(body.dob)) {
    return { valid: false, error: "Date of birth is required (YYYY-MM-DD)" };
  }

  if (!body.zip || !/^\d{5}$/.test(body.zip)) {
    return { valid: false, error: "Zip code must be 5 digits" };
  }

  if (body.state && !/^[A-Z]{2}$/.test(body.state)) {
    return { valid: false, error: "State must be a 2-letter abbreviation" };
  }

  if (!body.annual_household_income?.trim()) {
    return { valid: false, error: "Annual household income is required" };
  }

  if (!["yes", "no"].includes(body.has_major_medical)) {
    return { valid: false, error: "Please indicate if you have major medical insurance" };
  }

  if (body.has_major_medical === "yes" && !["aca", "employer", "private"].includes(body.current_coverage_type)) {
    return { valid: false, error: "Please select your current coverage type" };
  }

  if (!body.sms_consent) {
    return { valid: false, error: "SMS consent is required to proceed" };
  }

  return { valid: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.CRM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CRM_WEBHOOK_SECRET environment variable is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const body = req.body;
    const validation = validatePayload(body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const phone = (body.phone as string).replace(/\D/g, "");

    const payload: IntakePayload = {
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      phone,
      dob: body.dob,
      zip: body.zip,
      annual_household_income: body.annual_household_income.trim(),
      has_major_medical: body.has_major_medical,
      sms_consent: true,
      form_consent_source: "sakred_health_landing_page",
      form_consent_timestamp: new Date().toISOString(),
    };

    if (body.email?.trim()) payload.email = body.email.trim();
    if (body.state) payload.state = body.state.toUpperCase();
    if (body.household_size) payload.household_size = Number(body.household_size);
    if (body.has_major_medical === "yes") {
      payload.current_coverage_type = body.current_coverage_type;
    } else {
      payload.current_coverage_type = "none";
    }

    const webhookUrl = "https://www.sakredcrm.com/api/webhooks/leads?source=sakred+health+landing+page";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CRM webhook error:", response.status, errorText);
      return res.status(502).json({ error: "Failed to submit your information. Please try again." });
    }

    const result = await response.json();
    return res.status(200).json({ success: true, prospect_id: result.prospect_id });
  } catch (error) {
    console.error("Intake submission error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
