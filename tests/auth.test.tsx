import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "../src/features/auth/components/PasswordInput";
import {
  loginOtpSchema,
  otpSchema,
  recoverySchema,
  registerSchema,
} from "../src/features/auth/schemas/auth-schemas";
import { getPasswordStrength } from "../src/features/auth/utils/password-strength";

const validRegistration = {
  fullName: "Asha Kumar",
  mobile: "9876543210",
  email: "asha@example.com",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
  accountType: "dealer" as const,
  termsAccepted: true,
};

describe("auth form schemas", () => {
  it("accepts a valid public registration account", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("rejects Super Admin as a public registration account type", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      accountType: "super_admin",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords and unaccepted terms", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      confirmPassword: "DifferentPass123",
      termsAccepted: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toContain(
        "confirmPassword"
      );
      expect(result.error.issues.map((issue) => issue.path[0])).toContain(
        "termsAccepted"
      );
    }
  });

  it("validates Indian mobile numbers and exactly six OTP digits", () => {
    expect(loginOtpSchema.safeParse({ mobile: "9876543210" }).success).toBe(true);
    expect(loginOtpSchema.safeParse({ mobile: "1234567890" }).success).toBe(false);
    expect(otpSchema.safeParse("012345").success).toBe(true);
    expect(otpSchema.safeParse("12345").success).toBe(false);
  });

  it("accepts a valid recovery email or mobile number", () => {
    expect(recoverySchema.safeParse({ identifier: "9876543210" }).success).toBe(
      true
    );
    expect(
      recoverySchema.safeParse({ identifier: "asha@example.com" }).success
    ).toBe(true);
    expect(recoverySchema.safeParse({ identifier: "not-an-email" }).success).toBe(
      false
    );
  });
});

describe("password strength", () => {
  it("returns progressive feedback without exposing the password", () => {
    expect(getPasswordStrength("").label).toBe("Too short");
    expect(getPasswordStrength("simple").score).toBeLessThan(
      getPasswordStrength("SecurePass123!").score
    );
    expect(getPasswordStrength("SecurePass123!").label).toBe("Strong");
  });
});

describe("password visibility control", () => {
  it("toggles the password input type accessibly", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="test-password" label="Password" />);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });
});
