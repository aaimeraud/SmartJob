import { expect, test } from "@playwright/test";
import { prisma } from "@/lib/prisma";

const userId = `search-e2e-${Date.now()}`;
const title = `Offre recherche ${Date.now()}`;

test.describe("recherche des offres", () => {
  test.beforeAll(async () => {
    await prisma.user.create({
      data: {
        id: userId,
        name: "Search E2E",
        email: `${userId}@example.com`,
        role: "recruiter",
      },
    });
    await prisma.jobOffer.create({
      data: {
        title,
        description: "Une offre publiée pour tester la recherche.",
        location: "Bordeaux",
        contractType: "full_time",
        skills: ["TypeScript", "React"],
        salaryMin: 40_000,
        salaryMax: 55_000,
        status: "published",
        publishedAt: new Date(),
        recruiterId: userId,
      },
    });
  });

  test.afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
  });

  test("applique les filtres et reflète la recherche dans l'URL", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByLabel("Mot-clé").fill(title);
    await page.getByRole("button", { name: "Rechercher" }).click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get("q"))
      .toBe(title);
    await expect(page.getByText(title)).toBeVisible();
  });
});
