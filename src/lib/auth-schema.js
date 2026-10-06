import { z } from "zod";

export const roleSchema = z.enum(["candidate", "recruiter", "admin"]);

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  role: roleSchema.default("candidate"),
});
