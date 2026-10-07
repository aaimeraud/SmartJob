import { prisma } from "@/lib/prisma";
import {
  createJobOfferSchema,
  jobOfferStatusSchema,
} from "@/lib/job-offer-schema";
import { requireRole } from "@/lib/authorization";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "true";

  if (mine) {
    const result = await requireRole(request, ["recruiter"]);
    if ("response" in result) {
      return result.response;
    }

    const offers = await prisma.jobOffer.findMany({
      where: { recruiterId: result.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ offers });
  }

  const status = url.searchParams.get("status") ?? "published";
  const parsedStatus = jobOfferStatusSchema.safeParse(status);
  if (!parsedStatus.success || parsedStatus.data !== "published") {
    return NextResponse.json(
      { error: "Only published offers are publicly available" },
      { status: 400 },
    );
  }

  const offers = await prisma.jobOffer.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json({ offers });
}

export async function POST(request: Request) {
  const result = await requireRole(request, ["recruiter"]);
  if ("response" in result) {
    return result.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createJobOfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid job offer data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const offer = await prisma.jobOffer.create({
    data: {
      ...parsed.data,
      recruiterId: result.user.id,
      publishedAt: parsed.data.status === "published" ? new Date() : null,
    },
  });

  return NextResponse.json({ offer }, { status: 201 });
}
