import { describe, expect, it } from "vitest";
import {
  createJobOfferSchema,
  jobOfferSearchSchema,
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

  it("parses search filters and pagination defaults", () => {
    expect(
      jobOfferSearchSchema.parse({
        q: "typescript",
        skills: "TypeScript, React",
        minSalary: "40000",
      }),
    ).toMatchObject({
      q: "typescript",
      skills: ["TypeScript", "React"],
      minSalary: 40_000,
      page: 1,
      pageSize: 10,
    });
  });

  it("rejects an invalid salary filter range", () => {
    expect(
      jobOfferSearchSchema.safeParse({
        minSalary: "60000",
        maxSalary: "50000",
      }).success,
    ).toBe(false);
  });

  it("rejects unknown search filters", () => {
    expect(
      jobOfferSearchSchema.safeParse({ keyword: "typescript" }).success,
    ).toBe(false);
  });
});
