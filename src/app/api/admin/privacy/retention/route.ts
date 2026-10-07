import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const defaultRetentionDays = 365;

export async function POST(request: Request) {
  const cronSecret = process.env.PRIVACY_RETENTION_CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const hasCronAccess =
    Boolean(cronSecret) && authorization === `Bearer ${cronSecret}`;

  if (!hasCronAccess) {
    const result = await requireRole(request, ["admin"]);
    if ("response" in result) {
      return result.response;
    }
  }

  const configuredDays = Number(process.env.CV_RETENTION_DAYS ?? defaultRetentionDays);
  const retentionDays =
    Number.isInteger(configuredDays) && configuredDays > 0
      ? configuredDays
      : defaultRetentionDays;
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const deleted = await prisma.application.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  await prisma.rateLimitBucket.deleteMany({
    where: { resetAt: { lt: new Date() } },
  });

  return NextResponse.json({
    deletedApplications: deleted.count,
    retentionDays,
    cutoff: cutoff.toISOString(),
  });
}
