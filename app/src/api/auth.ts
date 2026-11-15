import type {
  AppUser,
  GoogleAuthResponse,
  UserRole,
} from "../types/auth";
import { ApiError, apiFetch } from "./http";

type MeResponse = { user: AppUser };

export async function postGoogleAuth(body: {
  idToken: string;
  role?: UserRole;
  name?: string;
  phone?: string;
}): Promise<GoogleAuthResponse> {
  try {
    return await apiFetch<GoogleAuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 422) {
      const body = err.body as {
        needsProfile?: boolean;
        email?: string;
        suggestedName?: string;
        missing?: string[];
      };
      if (body?.needsProfile) {
        return {
          needsProfile: true,
          email: body.email ?? "",
          suggestedName: body.suggestedName,
          missing: body.missing ?? [],
        };
      }
    }
    throw err;
  }
}

export async function getMe(token: string): Promise<AppUser> {
  const res = await apiFetch<MeResponse>("/api/me", { token });
  return res.user;
}

export async function updateMe(
  token: string,
  patch: { name?: string; phone?: string; email?: string }
): Promise<AppUser> {
  const res = await apiFetch<MeResponse>("/api/me", {
    method: "PUT",
    token,
    body: JSON.stringify(patch),
  });
  return res.user;
}