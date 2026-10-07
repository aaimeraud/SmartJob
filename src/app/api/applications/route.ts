import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.user.role === "candidate") {
    const applications = await prisma.application.findMany({
      where: { candidateId: session.user.id },
      select: {
        id: true,
        jobOfferId: true,
        cvFilename: true,
        cvMimeType: true,
        cvSize: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        jobOffer: {
          select: { id: true, title: true, location: true, recruiterId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  }

  const result = await requireRole(request, ["recruiter"]);
  if ("response" in result) {
    return result.response;
  }

  const applications = await prisma.application.findMany({
    where: { jobOffer: { recruiterId: result.user.id } },
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
      candidate: { select: { id: true, name: true, email: true } },
      jobOffer: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}
