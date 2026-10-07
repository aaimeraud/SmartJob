import { requireRole } from "@/lib/authorization";
import { applicationStatusUpdateSchema } from "@/lib/application-schema";
import { prisma } from "@/lib/prisma";
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

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      cvData: true,
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

  return new Response(application.cvData, {
    headers: {
      "Content-Type": application.cvMimeType,
      "Content-Disposition": `attachment; filename="${application.cvFilename.replaceAll('"', "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
