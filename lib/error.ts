const GENERIC_ERROR = "Something went wrong. Please try again.";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return GENERIC_ERROR;
}
