export type SessionUser = {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  defaultReminderMinutes: number | null;
};

export type SessionAdmin = {
  id: number;
  name: string;
  email: string;
};
