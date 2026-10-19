import { z } from "zod";
import { AUTH_ACCOUNT_TYPES } from "../types/auth";

const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number.");

const strongPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .regex(/[a-z]/, "Add a lowercase letter.")
  .regex(/[A-Z]/, "Add an uppercase letter.")
  .regex(/\d/, "Add a number.");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(100, "Name must be 100 characters or fewer."),
    mobile: mobileSchema,
    email: z.email("Enter a valid email address."),
    password: strongPasswordSchema,
    confirmPassword: z.string(),
    accountType: z.enum(AUTH_ACCOUNT_TYPES, {
      error: "Choose an account type.",
    }),
    termsAccepted: z.boolean().refine((accepted) => accepted, {
      message: "You must accept the terms to create an account.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const loginOtpSchema = z.object({ mobile: mobileSchema });

export const loginPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(128),
});

export const otpSchema = z.string().regex(/^\d{6}$/, "Enter all 6 digits.");

export const recoverySchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your mobile number or email address.")
    .max(254, "Enter a valid mobile number or email address.")
    .refine(
      (value) =>
        /^[6-9]\d{9}$/.test(value) ||
        z.email().safeParse(value).success,
      "Enter a valid 10-digit Indian mobile number or email address."
    ),
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginOtpFormValues = z.infer<typeof loginOtpSchema>;
export type LoginPasswordFormValues = z.infer<typeof loginPasswordSchema>;
export type RecoveryFormValues = z.infer<typeof recoverySchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
