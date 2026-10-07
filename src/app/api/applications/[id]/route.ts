import { requireRole } from "@/lib/authorization";
import { applicationStatusUpdateSchema } from "@/lib/application-schema";
import { decryptCv } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const result = await requireRole(request, ["recruiter"]);
  if ("response" in result) {
    return result.response;
  }

  const { id } = await context.params;
  const existing = await prisma.application.findFirst({
    where: { id, jobOffer: { recruiterId: result.user.id } },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = applicationStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application status", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const application = await prisma.application.update({
    where: { id },
    data: { status: parsed.data.status },
    select: { id: true, status: true, updatedAt: true },
  });
  return NextResponse.json({ application });
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await requireRole(request, ["candidate", "recruiter"]);
  if ("response" in session) {
    return session.response;
  }
  const rateLimit = consumeRateLimit(`cv-download:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many CV downloads. Try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      cvData: true,
      cvIv: true,
      cvAuthTag: true,
      cvFilename: true,
      cvMimeType: true,
      candidateId: true,
      jobOffer: { select: { recruiterId: true } },
    },
  });
  if (
    !application ||
    (session.user.role === "candidate"
      ? application.candidateId !== session.user.id
      : application.jobOffer.recruiterId !== session.user.id)
  ) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const decryptedCv = decryptCv(
    application.cvData,
    application.cvIv,
    application.cvAuthTag,
  );
  return new Response(decryptedCv, {
    headers: {
      "Content-Type": application.cvMimeType,
      "Content-Disposition": `attachment; filename="${application.cvFilename.replace(
        /["\r\n]/g,
        "",
      )}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const result = await requireRole(request, ["candidate"]);
  if ("response" in result) {
    return result.response;
  }
  const { id } = await context.params;
  const application = await prisma.application.findFirst({
    where: { id, candidateId: result.user.id },
    select: { id: true },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  await prisma.application.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
