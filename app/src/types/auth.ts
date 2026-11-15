export type UserRole = "customer" | "driver" | "admin";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: string;
};

export type GoogleAuthResponse =
  | {
      token: string;
      user: AppUser;
    }
  | {
      needsProfile: true;
      email: string;
      suggestedName?: string;
      missing: string[];
    };

export type ApiErrorBody = {
  error?: string;
  needsProfile?: boolean;
  missing?: string[];
};