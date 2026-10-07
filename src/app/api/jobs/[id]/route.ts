import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { updateJobOfferSchema } from "@/lib/job-offer-schema";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const offer = await prisma.jobOffer.findUnique({ where: { id } });

  if (!offer) {
    return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
  }

  if (offer.status === "published") {
    return NextResponse.json({ offer });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.id !== offer.recruiterId) {
    return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
  }

  return NextResponse.json({ offer });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await requireRole(request, ["recruiter"]);
  if ("response" in result) {
    return result.response;
  }

  const existing = await prisma.jobOffer.findUnique({ where: { id } });
  if (!existing || existing.recruiterId !== result.user.id) {
    return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateJobOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid job offer data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const nextStatus = parsed.data.status ?? existing.status;
  const offer = await prisma.jobOffer.update({
    where: { id },
    data: {
      ...parsed.data,
      publishedAt:
        nextStatus === "published"
          ? existing.publishedAt ?? new Date()
          : null,
    },
  });

  return NextResponse.json({ offer });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const result = await requireRole(request, ["recruiter"]);
  if ("response" in result) {
    return result.response;
  }

  const existing = await prisma.jobOffer.findUnique({ where: { id } });
  if (!existing || existing.recruiterId !== result.user.id) {
    return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
  }

  await prisma.jobOffer.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
