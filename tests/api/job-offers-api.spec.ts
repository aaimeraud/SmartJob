import { expect, test, type APIRequestContext } from "@playwright/test";
import { prisma } from "@/lib/prisma";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

const offer = {
  title: "Développeur TypeScript",
  description: "Construisez des fonctionnalités fiables pour notre plateforme.",
  location: "Paris",
  contractType: "full_time",
  salaryMin: 42_000,
  salaryMax: 55_000,
  skills: ["TypeScript", "React"],
  status: "published",
};

const filterOffer = {
  ...offer,
  title: "Recherche filtres TypeScript",
  description: "Une offre conçue pour vérifier les filtres de recherche.",
  location: "Lyon",
  skills: ["TypeScript", "Node.js"],
  salaryMin: 45_000,
  salaryMax: 60_000,
};

async function createUser(
  request: APIRequestContext,
  email: string,
) {
  const response = await request.post("/api/auth/sign-up/email", {
    data: {
      name: "Job Offer Test",
      email,
      password: "correct-horse-battery-staple",
    },
  });
  expect(response.ok()).toBeTruthy();
}

test.describe("API des offres d'emploi", () => {
  test.afterAll(async () => {
    await prisma.jobOffer.deleteMany({
      where: { title: { in: [offer.title, filterOffer.title] } },
    });
  });

  test("refuse la création sans session et la lecture des brouillons", async ({
    request,
  }) => {
    const createResponse = await request.post("/api/jobs", { data: offer });
    expect(createResponse.status()).toBe(401);

    const invalidStatus = await request.get("/api/jobs?status=draft");
    expect(invalidStatus.status()).toBe(400);
  });

  test("crée et publie une offre pour un recruteur", async ({ request }) => {
    const email = uniqueEmail("recruiter");
    await createUser(request, email);
    await prisma.user.update({
      where: { email },
      data: { role: "recruiter" },
    });

    const createResponse = await request.post("/api/jobs", { data: offer });
    expect(createResponse.status()).toBe(201);
    const created = (await createResponse.json()) as {
      offer: { id: string; status: string; recruiterId: string };
    };
    expect(created.offer.status).toBe("published");
    expect(created.offer.recruiterId).toBeTruthy();

    const mineResponse = await request.get("/api/jobs?mine=true");
    expect(mineResponse.ok()).toBeTruthy();
    await expect(mineResponse.json()).resolves.toMatchObject({
      offers: [{ id: created.offer.id }],
    });

    const updateResponse = await request.patch(
      `/api/jobs/${created.offer.id}`,
      { data: { status: "draft" } },
    );
    expect(updateResponse.ok()).toBeTruthy();

    const publicResponse = await request.get("/api/jobs");
    const publicData = (await publicResponse.json()) as {
      offers: Array<{ id: string }>;
    };
    expect(publicData.offers.some(({ id }) => id === created.offer.id)).toBe(
      false,
    );
  });

  test("interdit à un candidat de gérer les offres", async ({ request }) => {
    await createUser(request, uniqueEmail("candidate"));
    const response = await request.post("/api/jobs", { data: offer });
    expect(response.status()).toBe(403);
  });

  test("filtre les offres publiées et pagine les résultats", async ({
    request,
  }) => {
    const email = uniqueEmail("search-recruiter");
    await createUser(request, email);
    await prisma.user.update({
      where: { email },
      data: { role: "recruiter" },
    });

    const createResponse = await request.post("/api/jobs", {
      data: filterOffer,
    });
    expect(createResponse.status()).toBe(201);

    const response = await request.get(
      "/api/jobs?q=Recherche%20filtres&location=Lyon&contractType=full_time&skills=TypeScript&minSalary=40000&maxSalary=70000&page=1&pageSize=1",
    );
    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toMatchObject({
      offers: [{ title: filterOffer.title }],
      pagination: { page: 1, pageSize: 1, total: 1, totalPages: 1 },
    });

    const invalidResponse = await request.get("/api/jobs?page=0");
    expect(invalidResponse.status()).toBe(400);
  });
});
