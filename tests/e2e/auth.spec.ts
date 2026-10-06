import { expect, test } from "@playwright/test";

function uniqueEmail() {
  return `candidate-${Date.now()}@example.com`;
}

test.describe("authentification", () => {
  test("crée un compte candidat et permet la déconnexion", async ({ page }) => {
    const email = uniqueEmail();
    await page.goto("/");
    await page.getByLabel("Nom").fill("Ada Lovelace");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill("correct-horse-battery-staple");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Session active")).toBeVisible();
    await expect(page.getByText("candidate", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page.getByText("Vous êtes déconnecté.")).toBeVisible();

    await page.getByRole("button", { name: "Se connecter" }).first().click();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill("correct-horse-battery-staple");
    await page.getByRole("button", { name: "Se connecter" }).last().click();
    await expect(page.getByText("Session active")).toBeVisible();
  });
});
