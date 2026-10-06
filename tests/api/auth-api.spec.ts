import { expect, test } from "@playwright/test";

function uniqueEmail() {
  return `api-candidate-${Date.now()}@example.com`;
}

test.describe("API d'authentification", () => {
  test("refuse une zone protégée sans session", async ({ request }) => {
    const response = await request.get("/api/recruiter/access");

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "Authentication required",
    });
  });

  test("valide les données d'inscription côté serveur", async ({ request }) => {
    const response = await request.post("/api/auth/sign-up/email", {
      data: {
        name: "A",
        email: "invalid",
        password: "short",
      },
    });

    expect(response.status()).toBe(400);
  });

  test("refuse l'accès recruteur à un candidat", async ({ request }) => {
    const response = await request.post("/api/auth/sign-up/email", {
      data: {
        name: "Candidate Test",
        email: uniqueEmail(),
        password: "correct-horse-battery-staple",
      },
    });

    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toMatchObject({
      user: { role: "candidate" },
    });

    const recruiterResponse = await request.get("/api/recruiter/access");
    expect(recruiterResponse.status()).toBe(403);
  });
});
