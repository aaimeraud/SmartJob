import { requireRole } from "@/lib/authorization";
import { decryptCv, encryptCv } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const result = await requireRole(request, ["admin"]);
  if ("response" in result) {
    return result.response;
  }

  const currentVersion = Number(process.env.CV_ENCRYPTION_KEY_VERSION ?? "1");
  if (!Number.isInteger(currentVersion) || currentVersion < 1) {
    return NextResponse.json(
      { error: "CV_ENCRYPTION_KEY_VERSION must be a positive integer" },
      { status: 500 },
    );
  }

  const applications = await prisma.application.findMany({
    where: { cvKeyVersion: { not: currentVersion } },
    select: {
      id: true,
      cvData: true,
      cvIv: true,
      cvAuthTag: true,
      cvKeyVersion: true,
    },
    take: 100,
  });

  let reencrypted = 0;
  for (const application of applications) {
    const decrypted = decryptCv(
      application.cvData,
      application.cvIv,
      application.cvAuthTag,
      application.cvKeyVersion,
    );
    const encrypted = encryptCv(decrypted);
    await prisma.application.update({
      where: { id: application.id },
      data: {
        cvData: encrypted.data,
        cvIv: encrypted.iv,
        cvAuthTag: encrypted.authTag,
        cvKeyVersion: encrypted.keyVersion,
      },
    });
    reencrypted += 1;
  }

  return NextResponse.json({
    reencrypted,
    remaining: applications.length === 100 ? "at least one batch remains" : 0,
  });
}
