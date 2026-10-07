import { requireRole } from "@/lib/authorization";
import {
  applicationMessageSchema,
  cvFileSchema,
} from "@/lib/application-schema";
import { encryptCv, hasValidCvSignature } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const result = await requireRole(request, ["candidate"]);
  if ("response" in result) {
    return result.response;
  }
  const rateLimit = consumeRateLimit(`application:${result.user.id}`, 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many applications submitted. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const { id: jobOfferId } = await context.params;
  const offer = await prisma.jobOffer.findUnique({
    where: { id: jobOfferId },
    select: { id: true, status: true },
  });
  if (!offer || offer.status !== "published") {
    return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const cv = formData.get("cv");
  const cvResult = cvFileSchema.safeParse(cv);
  if (!cvResult.success) {
    return NextResponse.json(
      { error: "Invalid CV file", issues: cvResult.error.issues },
      { status: 400 },
    );
  }
  if (!(await hasValidCvSignature(cvResult.data))) {
    return NextResponse.json(
      { error: "CV content does not match its declared file type" },
      { status: 400 },
    );
  }

  const messageResult = applicationMessageSchema.safeParse(formData.get("message"));
  if (!messageResult.success) {
    return NextResponse.json(
      { error: "Invalid application message", issues: messageResult.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.application.findUnique({
    where: { jobOfferId_candidateId: { jobOfferId, candidateId: result.user.id } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You have already applied to this job offer" },
      { status: 409 },
    );
  }

  const encryptedCv = encryptCv(Buffer.from(await cvResult.data.arrayBuffer()));
  const application = await prisma.application.create({
    data: {
      jobOfferId,
      candidateId: result.user.id,
      cvFilename: cvResult.data.name,
      cvMimeType: cvResult.data.type,
      cvSize: cvResult.data.size,
      cvData: encryptedCv.data,
      cvIv: encryptedCv.iv,
      cvAuthTag: encryptedCv.authTag,
      message: messageResult.data ?? null,
    },
    select: {
      id: true,
      jobOfferId: true,
      candidateId: true,
      cvFilename: true,
      cvMimeType: true,
      cvSize: true,
      message: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
