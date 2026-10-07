import { z } from "zod";

export const contractTypeSchema = z.enum([
  "full_time",
  "part_time",
  "contract",
  "internship",
  "apprenticeship",
  "freelance",
]);

export const jobOfferStatusSchema = z.enum(["draft", "published"]);

const nonNegativeIntegerSchema = z.coerce.number().int().nonnegative();

export const jobOfferSearchSchema = z
  .object({
    q: z.string().trim().min(1).max(160).optional(),
    location: z.string().trim().min(1).max(160).optional(),
    contractType: contractTypeSchema.optional(),
    skills: z
      .string()
      .transform((value) =>
        value
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.string().min(1).max(60)).max(30))
      .optional(),
    minSalary: nonNegativeIntegerSchema.optional(),
    maxSalary: nonNegativeIntegerSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict()
  .superRefine((data, context) => {
    if (
      data.minSalary !== undefined &&
      data.maxSalary !== undefined &&
      data.minSalary > data.maxSalary
    ) {
      context.addIssue({
        code: "custom",
        path: ["maxSalary"],
        message: "maxSalary must be greater than or equal to minSalary",
      });
    }
  });

const jobOfferFields = {
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(10_000),
  location: z.string().trim().min(2).max(160),
  contractType: contractTypeSchema,
  salaryMin: z.number().int().nonnegative().nullable(),
  salaryMax: z.number().int().nonnegative().nullable(),
  skills: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
  status: jobOfferStatusSchema,
};

export const createJobOfferSchema = z
  .object(jobOfferFields)
  .strict()
  .superRefine((data, context) => {
    if (
      data.salaryMin !== null &&
      data.salaryMax !== null &&
      data.salaryMin > data.salaryMax
    ) {
      context.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "salaryMax must be greater than or equal to salaryMin",
      });
    }
  });

export const updateJobOfferSchema = z
  .object({
    ...jobOfferFields,
  })
  .partial()
  .strict()
  .superRefine((data, context) => {
    if (
      data.salaryMin !== undefined &&
      data.salaryMax !== undefined &&
      data.salaryMin !== null &&
      data.salaryMax !== null &&
      data.salaryMin > data.salaryMax
    ) {
      context.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "salaryMax must be greater than or equal to salaryMin",
      });
    }
  });

export type CreateJobOfferInput = z.infer<typeof createJobOfferSchema>;
export type UpdateJobOfferInput = z.infer<typeof updateJobOfferSchema>;
export type JobOfferSearchInput = z.infer<typeof jobOfferSearchSchema>;
