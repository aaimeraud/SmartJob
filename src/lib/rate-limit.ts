import { prisma } from "@/lib/prisma";

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const current = await prisma.rateLimitBucket.findUnique({ where: { key } });

  if (!current || current.resetAt <= now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt },
      update: { count: 1, resetAt },
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const updated = await prisma.rateLimitBucket.updateMany({
    where: { key, resetAt: { gt: now }, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });
  if (updated.count === 0) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt.getTime() - now.getTime()) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}
