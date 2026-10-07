import { expect, request as playwrightRequest, test } from "@playwright/test";
import { prisma } from "@/lib/prisma";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

test.describe("API des candidatures", () => {
  let recruiterId: string;
  let jobOfferId: string;
  const createdUserIds: string[] = [];

  test.beforeAll(async () => {
    recruiterId = `application-recruiter-${Date.now()}`;
    createdUserIds.push(recruiterId);
    const recruiter = await prisma.user.create({
      data: {
        id: recruiterId,
        name: "Application Recruiter",
        email: `${recruiterId}@example.com`,
        role: "recruiter",
      },
    });
    const offer = await prisma.jobOffer.create({
      data: {
        title: `Offer applications ${Date.now()}`,
        description: "Une offre publiée pour tester les candidatures.",
        location: "Paris",
        contractType: "full_time",
        skills: ["TypeScript"],
        status: "published",
        publishedAt: new Date(),
        recruiterId: recruiter.id,
      },
    });
    jobOfferId = offer.id;
  });

  test.afterAll(async () => {
    await prisma.application.deleteMany({ where: { jobOfferId } });
    await prisma.jobOffer.delete({ where: { id: jobOfferId } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  });

  test("crée une candidature, refuse les doublons et expose les données au recruteur", async ({
    request,
  }) => {
    const candidateEmail = uniqueEmail("candidate-application");
    const signup = await request.post("/api/auth/sign-up/email", {
      data: {
        name: "Application Candidate",
        email: candidateEmail,
        password: "correct-horse-battery-staple",
      },
    });
    expect(signup.ok()).toBeTruthy();

    const form = new FormData();
    form.append(
      "cv",
      new File(["%PDF-1.7 test"], "cv.pdf", { type: "application/pdf" }),
    );
    form.append("message", "Je souhaite rejoindre votre équipe.");
    const response = await request.post(`/api/jobs/${jobOfferId}/applications`, {
      multipart: form,
    });
    expect(response.status()).toBe(201);
    const data = (await response.json()) as {
      application: { id: string; status: string; cvData?: string };
    };
    expect(data.application.status).toBe("submitted");
    expect(data.application.cvData).toBeUndefined();
    const stored = await prisma.application.findUniqueOrThrow({
      where: { id: data.application.id },
      select: { cvData: true, cvIv: true, cvAuthTag: true },
    });
    expect(Buffer.from(stored.cvData).equals(Buffer.from("%PDF-1.7 test"))).toBe(
      false,
    );
    expect(stored.cvIv).toHaveLength(12);
    expect(stored.cvAuthTag).toHaveLength(16);

    const duplicate = await request.post(
      `/api/jobs/${jobOfferId}/applications`,
      { multipart: form },
    );
    expect(duplicate.status()).toBe(409);

    const own = await request.get("/api/applications");
    expect(own.ok()).toBeTruthy();
    await expect(own.json()).resolves.toMatchObject({
      applications: [{ jobOfferId, status: "submitted" }],
    });

    const recruiterContext = await playwrightRequest.newContext({
      baseURL: "http://localhost:3000",
    });
    try {
      const recruiterEmail = uniqueEmail("recruiter-application");
      const recruiterSignup = await recruiterContext.post(
        "/api/auth/sign-up/email",
        {
          data: {
            name: "Application Recruiter Session",
            email: recruiterEmail,
            password: "correct-horse-battery-staple",
          },
        },
      );
      expect(recruiterSignup.ok()).toBeTruthy();
      const recruiterUser = await prisma.user.update({
        where: { email: recruiterEmail },
        data: { role: "recruiter" },
      });
      createdUserIds.push(recruiterUser.id);
      await prisma.jobOffer.update({
        where: { id: jobOfferId },
        data: { recruiterId: recruiterUser.id },
      });
      const recruiterApplications = await recruiterContext.get("/api/applications");
      expect(recruiterApplications.ok()).toBeTruthy();
      const recruiterData = (await recruiterApplications.json()) as {
        applications: Array<{ id: string }>;
      };
      expect(recruiterData.applications).toHaveLength(1);
      const update = await recruiterContext.patch(
        `/api/applications/${recruiterData.applications[0].id}`,
        { data: { status: "reviewing" } },
      );
      expect(update.ok()).toBeTruthy();
      const cvResponse = await recruiterContext.get(
        `/api/applications/${recruiterData.applications[0].id}`,
      );
      expect(cvResponse.ok()).toBeTruthy();
      expect(cvResponse.headers()["content-type"]).toContain("application/pdf");
      const deleteResponse = await request.delete(
        `/api/applications/${data.application.id}`,
      );
      expect(deleteResponse.status()).toBe(204);
    } finally {
      await recruiterContext.dispose();
    }
  });

  test("refuse une candidature non authentifiée et un fichier invalide", async ({
    request,
  }) => {
    const unauthenticated = await request.post(
      `/api/jobs/${jobOfferId}/applications`,
      { multipart: { cv: { name: "cv.txt", mimeType: "text/plain", buffer: Buffer.from("x") } } },
    );
    expect(unauthenticated.status()).toBe(401);
  });
});
