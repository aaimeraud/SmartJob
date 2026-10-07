import { prisma } from "@/lib/prisma";

export async function logCvAccess(
  userId: string,
  applicationId: string,
  action: "download",
) {
  await prisma.cvAccessLog.create({
    data: { userId, applicationId, action },
  });
}
