export type ErrorCode =
  | "EMAIL_TAKEN"
  | "USER_NOT_FOUND"
  | "EMAIL_NOT_VERIFIED"
  | "LIMIT_REACHED"
  | "SLOT_NOT_FOUND"
  | "SLOT_TAKEN"
  | "SLOT_PAST"
  | "OUT_OF_WINDOW"
  | "RESERVATION_NOT_FOUND"
  | "ALREADY_CANCELLED"
  | "RESERVATION_PAST"
  | "REMINDER_LOCKED"
  | "WRONG_PASSWORD";

/** An expected, user-facing failure. The message is safe to show. */
export class ServiceError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
