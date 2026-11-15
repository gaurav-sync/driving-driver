import * as SecureStore from "expo-secure-store";
import type { AppUser } from "../types/auth";

const TOKEN_KEY = "local_drivers_auth_token";

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export type AuthSnapshot = {
  token: string;
  user: AppUser;
};