import { describe, expect, it } from "vitest";
import { signUpSchema } from "@/lib/auth-schema";

describe("signUpSchema", () => {
  it("accepts valid candidate registration data", () => {
    const result = signUpSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "correct-horse-battery-staple",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a client-provided role", () => {
    const result = signUpSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "correct-horse-battery-staple",
      role: "admin",
    });

    expect(result.success).toBe(false);
  });

  it("rejects weak passwords", () => {
    const result = signUpSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
