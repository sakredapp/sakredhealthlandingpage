import crypto from "crypto";

export function generateAdminToken(): string {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error(
      "SESSION_SECRET environment variable is required for admin authentication"
    );
  }
  const timestamp = Date.now();
  const payload = `admin-auth:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("hex");
  return `${timestamp}:${signature}`;
}

export function verifyAdminToken(token: string): boolean {
  if (!token) return false;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) return false;
  const parts = token.split(":");
  if (parts.length !== 2) return false;
  const [timestamp, signature] = parts;
  const payload = `admin-auth:${timestamp}`;
  const expectedSignature = crypto
    .createHmac("sha256", sessionSecret)
    .update(payload)
    .digest("hex");
  if (signature !== expectedSignature) return false;
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  const maxAge = 24 * 60 * 60 * 1000;
  return tokenAge < maxAge;
}

/** CORS headers for API responses */
export function setCorsHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
}
