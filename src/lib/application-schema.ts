import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "submitted",
  "reviewing",
  "accepted",
  "rejected",
]);

export const applicationMessageSchema = z
  .string()
  .trim()
  .max(2_000)
  .nullable()
  .optional();

export const applicationStatusUpdateSchema = z.object({
  status: applicationStatusSchema,
}).strict();

export const allowedCvMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const maxCvSizeBytes = 5 * 1024 * 1024;

export const cvFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "CV file cannot be empty")
  .refine(
    (file) => file.size <= maxCvSizeBytes,
    "CV file must not exceed 5 MB",
  )
  .refine(
    (file) =>
      (allowedCvMimeTypes as readonly string[]).includes(file.type),
    "CV must be a PDF or DOCX file",
  );

export const applicationFormSchema = z.object({
  cv: cvFileSchema,
  message: applicationMessageSchema,
});

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
