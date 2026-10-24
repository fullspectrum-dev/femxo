import { z } from "zod";

// Mirrors femxo-backend modules/identity/src/password.ts. The backend checks
// these again; the form only catches mistakes before a round trip.
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_MIN_LENGTH = 8;
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

export const passwordMinLength = (isSuperAdmin: boolean) =>
  isSuperAdmin ? ADMIN_PASSWORD_MIN_LENGTH : PASSWORD_MIN_LENGTH;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(PASSWORD_MAX_LENGTH, `Passwords are at most ${PASSWORD_MAX_LENGTH} characters.`),
});

export function changePasswordSchema(isSuperAdmin: boolean) {
  const min = passwordMinLength(isSuperAdmin);
  return z
    .object({
      currentPassword: z.string().min(1, "Enter your current password.").max(PASSWORD_MAX_LENGTH),
      newPassword: z
        .string()
        .min(min, `Use at least ${min} characters.`)
        .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters.`),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      path: ["newPassword"],
      message: "Choose a password different from your current one.",
    });
}

export type LoginFormValues = z.input<typeof loginSchema>;
export type ChangePasswordFormValues = z.infer<ReturnType<typeof changePasswordSchema>>;
