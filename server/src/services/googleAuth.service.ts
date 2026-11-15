import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
};

let client: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }
  if (!client) {
    client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  }
  return client;
}

/** Supports multiple client IDs (web + Android) via comma-separated env value. */
function allowedAudiences(): string[] {
  return (env.GOOGLE_CLIENT_ID ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<GoogleProfile> {
  const oauth = getClient();
  const ticket = await oauth.verifyIdToken({
    idToken,
    audience: allowedAudiences(),
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error("Google token missing required fields");
  }
  if (payload.email_verified === false) {
    throw new Error("Google email is not verified");
  }
  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified ?? true,
    name: payload.name,
    picture: payload.picture,
  };
}