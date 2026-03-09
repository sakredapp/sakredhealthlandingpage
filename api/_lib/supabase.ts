import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function saveNewsletterSubscriberToSupabase(
  email: string,
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return { success: false, error: "Email already subscribed" };
    }

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: email.toLowerCase(),
      first_name: firstName || null,
      subscribed_at: new Date().toISOString(),
      source: "landing_page",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error saving to Supabase:", err);
    return { success: false, error: "Failed to save subscriber" };
  }
}

export async function getSubscriberFromSupabase(
  email: string
): Promise<any | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function saveEmailSignup(
  email: string,
  source: string = "website"
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { data: existing } = await supabase
      .from("email_signups")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return { success: true };
    }

    const { error } = await supabase.from("email_signups").insert({
      email: email.toLowerCase(),
      source: source,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase email signup error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error saving email signup:", err);
    return { success: false, error: "Failed to save email" };
  }
}
