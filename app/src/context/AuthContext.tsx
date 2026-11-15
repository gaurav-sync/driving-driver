import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, postGoogleAuth } from "../api/auth";
import { ApiError } from "../api/http";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "../storage/authStorage";
import type { AppUser, UserRole } from "../types/auth";

type AuthState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; token: string; user: AppUser }
  | { status: "needsProfile"; idToken: string; email: string; suggestedName?: string };

type AuthContextValue = {
  state: AuthState;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  completeProfile: (input: {
    role: UserRole;
    name: string;
    phone: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const applySession = useCallback(async (token: string, user: AppUser) => {
    await setStoredToken(token);
    setState({ status: "signedIn", token, user });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getStoredToken();
      if (!token) {
        if (!cancelled) setState({ status: "signedOut" });
        return;
      }
      try {
        const user = await getMe(token);
        if (!cancelled) setState({ status: "signedIn", token, user });
      } catch {
        await clearStoredToken();
        if (!cancelled) setState({ status: "signedOut" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string) => {
      const res = await postGoogleAuth({ idToken });
      if ("needsProfile" in res && res.needsProfile === true) {
        setState({
          status: "needsProfile",
          idToken,
          email: res.email,
          suggestedName: res.suggestedName,
        });
        return;
      }
      if ("token" in res && res.token && res.user) {
        await applySession(res.token, res.user);
      }
    },
    [applySession]
  );

  const completeProfile = useCallback(
    async (input: { role: UserRole; name: string; phone: string }) => {
      if (state.status !== "needsProfile") return;
      const res = await postGoogleAuth({
        idToken: state.idToken,
        role: input.role === "admin" ? undefined : input.role,
        name: input.name,
        phone: input.phone,
      });
      if ("token" in res && res.token && res.user) {
        await applySession(res.token, res.user);
      } else {
        throw new ApiError(422, "profile_incomplete", res);
      }
    },
    [applySession, state]
  );

  const signOut = useCallback(async () => {
    await clearStoredToken();
    setState({ status: "signedOut" });
  }, []);

  const refreshUser = useCallback(async () => {
    if (state.status !== "signedIn") return;
    const user = await getMe(state.token);
    setState({ status: "signedIn", token: state.token, user });
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      signInWithGoogleIdToken,
      completeProfile,
      signOut,
      refreshUser,
    }),
    [state, signInWithGoogleIdToken, completeProfile, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}