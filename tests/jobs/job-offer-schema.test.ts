import { describe, expect, it } from "vitest";
import {
  createJobOfferSchema,
  updateJobOfferSchema,
} from "@/lib/job-offer-schema";

const validOffer = {
  title: "Développeur TypeScript",
  description: "Construisez des fonctionnalités fiables pour notre plateforme.",
  location: "Paris",
  contractType: "full_time" as const,
  salaryMin: 42_000,
  salaryMax: 55_000,
  skills: ["TypeScript", "React"],
  status: "draft" as const,
};

describe("job offer validation", () => {
  it("accepts a complete valid offer", () => {
    expect(createJobOfferSchema.safeParse(validOffer).success).toBe(true);
  });

  it("rejects a salary range where the minimum is greater than the maximum", () => {
    const result = createJobOfferSchema.safeParse({
      ...validOffer,
      salaryMin: 60_000,
      salaryMax: 50_000,
    });

    expect(result.success).toBe(false);
  });

  it("accepts partial updates", () => {
    expect(updateJobOfferSchema.safeParse({ status: "published" }).success).toBe(
      true,
    );
  });

  it("rejects unknown fields", () => {
    expect(
      createJobOfferSchema.safeParse({ ...validOffer, recruiterId: "user-id" })
        .success,
    ).toBe(false);
  });
});
