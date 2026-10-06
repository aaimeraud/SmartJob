import { describe, expect, it } from "vitest";
import { signUpSchema } from "./auth-schema";

describe("signUpSchema", () => {
  it("defaults new accounts to the candidate role", () => {
    const result = signUpSchema.parse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "correct-horse-battery-staple",
    });

    expect(result.role).toBe("candidate");
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
