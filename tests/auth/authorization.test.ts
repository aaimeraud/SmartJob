import { describe, expect, it } from "vitest";
import { isRoleAllowed } from "@/lib/authorization";

describe("role authorization", () => {
  it("allows recruiters into recruiter areas", () => {
    expect(isRoleAllowed("recruiter", ["recruiter", "admin"])).toBe(true);
  });

  it("allows admins into recruiter areas", () => {
    expect(isRoleAllowed("admin", ["recruiter", "admin"])).toBe(true);
  });

  it("forbids candidates from recruiter areas", () => {
    expect(isRoleAllowed("candidate", ["recruiter", "admin"])).toBe(false);
  });
});
