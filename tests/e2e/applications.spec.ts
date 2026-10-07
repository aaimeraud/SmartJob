import { expect, test } from "@playwright/test";
import { prisma } from "@/lib/prisma";

const recruiterId = `applications-ui-recruiter-${Date.now()}`;
let jobOfferId: string;
let candidateEmail: string;
const title = `Candidature UI ${Date.now()}`;

test.describe("candidature depuis le job board", () => {
  test.beforeAll(async () => {
    await prisma.user.create({
      data: {
        id: recruiterId,
        name: "Applications UI Recruiter",
        email: `${recruiterId}@example.com`,
        role: "recruiter",
      },
    });
    const offer = await prisma.jobOffer.create({
      data: {
        title,
        description: "Une offre publiée pour tester le formulaire candidat.",
        location: "Nantes",
        contractType: "full_time",
        skills: ["TypeScript"],
        status: "published",
        publishedAt: new Date(),
        recruiterId,
      },
    });
    jobOfferId = offer.id;
  });

  test.afterAll(async () => {
    await prisma.jobOffer.delete({ where: { id: jobOfferId } });
    await prisma.user.delete({ where: { id: recruiterId } });
    if (candidateEmail) {
      await prisma.user.delete({ where: { email: candidateEmail } });
    }
  });

  test("permet à un candidat d'envoyer son CV", async ({ page }) => {
    candidateEmail = `candidate-ui-${Date.now()}@example.com`;
    await page.goto("/");
    await page.getByLabel("Nom").fill("Candidate UI");
    await page.getByLabel("Email").fill(candidateEmail);
    await page.getByLabel("Mot de passe").fill("correct-horse-battery-staple");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText(title)).toBeVisible();

    const offerCard = page.getByRole("article").filter({ hasText: title });
    await offerCard.locator('input[type="file"]').setInputFiles({
      name: "cv.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7 test"),
    });
    await offerCard.getByPlaceholder("Message (optionnel)").fill("Bonjour !");
    await offerCard.getByRole("button", { name: "Postuler" }).click();

    await expect(page.getByText("Candidature envoyée.")).toBeVisible();
    await expect(page.getByText("statut : submitted")).toBeVisible();
  });
});
