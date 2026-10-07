import { prisma } from "@/lib/prisma";
import {
  createJobOfferSchema,
  jobOfferSearchSchema,
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

  const searchParams = Object.fromEntries(
    [...url.searchParams.entries()].filter(([key]) => key !== "status"),
  );
  const parsedSearch = jobOfferSearchSchema.safeParse(searchParams);
  if (!parsedSearch.success) {
    return NextResponse.json(
      { error: "Invalid job search filters", issues: parsedSearch.error.issues },
      { status: 400 },
    );
  }

  const {
    q,
    location,
    contractType,
    skills,
    minSalary,
    maxSalary,
    page,
    pageSize,
  } = parsedSearch.data;
  const where = {
    status: "published" as const,
    AND: [
      ...(q
        ? [
            {
              OR: [
                { title: { contains: q, mode: "insensitive" as const } },
                {
                  description: { contains: q, mode: "insensitive" as const },
                },
                { location: { contains: q, mode: "insensitive" as const } },
              ],
            },
          ]
        : []),
      ...(location
        ? [
            {
              location: {
                contains: location,
                mode: "insensitive" as const,
              },
            },
          ]
        : []),
      ...(contractType ? [{ contractType }] : []),
      ...(skills?.length ? [{ skills: { hasSome: skills } }] : []),
      ...(minSalary !== undefined
        ? [
            {
              OR: [{ salaryMax: { gte: minSalary } }, { salaryMax: null }],
            },
          ]
        : []),
      ...(maxSalary !== undefined
        ? [
            {
              OR: [{ salaryMin: { lte: maxSalary } }, { salaryMin: null }],
            },
          ]
        : []),
    ],
  };
  const [offers, total] = await prisma.$transaction([
    prisma.jobOffer.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.jobOffer.count({ where }),
  ]);

  return NextResponse.json({
    offers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
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
