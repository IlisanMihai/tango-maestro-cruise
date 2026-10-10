import { test, expect, type Page } from "../playwright-fixture";
import { EDITOR_ID, TEST_EMAIL, TEST_PASSWORD, mockSupabase } from "./support/supabaseMock";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Parolă").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Intră în cont" }).click();
  await expect(page.getByRole("navigation", { name: "Secțiuni" })).toBeVisible();
}

test("editors have no users page", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await expect(page.getByRole("link", { name: "Utilizatori" })).toHaveCount(0);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Evenimentele mele" })).toBeVisible();
});

test("an admin sees every account and can change roles and access", async ({ page }, testInfo) => {
  const db = await mockSupabase(page, "ok", { role: "admin" });
  await login(page);
  await page.getByRole("link", { name: "Utilizatori" }).click();
  await expect(page.getByRole("heading", { name: "Utilizatori", level: 1 })).toBeVisible();

  const list = page.getByTestId("staff-list");
  await expect(list.getByRole("listitem")).toHaveCount(3);
  // own account: marked and locked (cannot lock yourself out)
  await expect(list.getByText("(tu)")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Acces pentru Admin Test" })).toBeDisabled();
  await expect(page.getByLabel("Rolul lui Admin Test")).toBeDisabled();

  await page.getByRole("switch", { name: "Acces pentru Ana Editor" }).click();
  await expect(page.getByRole("switch", { name: "Acces pentru Ana Editor" })).toHaveText("Inactiv");
  await page.getByLabel("Rolul lui vechi@test.local").selectOption("admin");
  await expect.poll(() => db.profileWrites).toEqual([
    { id: EDITOR_ID, body: { active: false } },
    { id: "cccccccc-0000-4000-a000-000000000003", body: { role: "admin" } },
  ]);

  if (testInfo.project.name === "phone-portrait" || testInfo.project.name === "desktop") {
    await page.screenshot({ path: `e2e/screenshots/admin-users-${testInfo.project.name}.png`, fullPage: true });
  }
});

test("inviting by email sends the link back to the set-password page", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "admin" });
  await login(page);
  await page.goto("/admin/users");
  await page.getByLabel("Email *").fill("Maria@Test.local");
  await page.getByLabel("Nume").fill("Maria");
  await page.getByRole("button", { name: "Trimite invitația" }).click();
  await expect(page.getByText("Invitația a fost trimisă la Maria@Test.local.")).toBeVisible();
  await expect(page.getByTestId("staff-list").getByText("Maria", { exact: true })).toBeVisible();
  expect(db.invites[0]).toMatchObject({
    mode: "invite",
    email: "Maria@Test.local",
    name: "Maria",
    role: "editor",
    redirectTo: expect.stringMatching(/\/admin\/set-password$/),
  });
  // the form is ready for the next person
  await expect(page.getByLabel("Email *")).toHaveValue("");
});

test("creating an account with a password checks its length", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "admin" });
  await login(page);
  await page.goto("/admin/users");
  await page.getByRole("radio", { name: /Cont cu parolă/ }).click();
  await page.getByLabel("Email *").fill("ion@test.local");
  await page.getByLabel("Rol", { exact: true }).selectOption("admin");
  await page.getByLabel(/^Parolă \*/).fill("scurt");
  await page.getByRole("button", { name: "Creează contul" }).click();
  await expect(page.getByRole("alert")).toHaveText("Parola trebuie să aibă cel puțin 8 caractere.");
  expect(db.invites).toHaveLength(0);

  await page.getByLabel(/^Parolă \*/).fill("parola-lunga-1");
  await page.getByRole("button", { name: "Arată parola" }).click();
  await expect(page.getByLabel(/^Parolă \*/)).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Creează contul" }).click();
  await expect(page.getByText("Contul ion@test.local a fost creat. Spune-i persoanei parola aleasă.")).toBeVisible();
  expect(db.invites[0]).toMatchObject({ mode: "password", email: "ion@test.local", role: "admin", password: "parola-lunga-1" });
});

test("invitation problems are explained", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "admin" });
  await login(page);
  await page.goto("/admin/users");
  await page.getByLabel("Email *").fill("limit@test.local");
  await page.getByRole("button", { name: "Trimite invitația" }).click();
  await expect(page.getByRole("alert")).toContainText("prea multe emailuri");

  await page.getByLabel("Email *").fill("old@test.local");
  await page.getByRole("button", { name: "Trimite invitația" }).click();
  await expect(page.getByText("old@test.local avea deja cont: acum este activ.")).toBeVisible();
});

test("forgot password sends a reset link without revealing who has an account", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Am uitat parola" }).click();
  await expect(page.getByRole("alert")).toContainText("Scrie mai întâi adresa de email");

  await page.getByLabel("Email").fill("cineva@test.local");
  await page.getByRole("button", { name: "Am uitat parola" }).click();
  await expect(page.getByText(/Dacă adresa are cont, vei primi/)).toBeVisible();
  expect(db.recoveries[0]).toContain(encodeURIComponent("/admin/set-password"));
});

test("a signed-in person can set a new password", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Contul meu" }).click();
  await page.getByRole("link", { name: "Schimbă parola" }).click();
  await expect(page.getByRole("heading", { name: "Setează parola" })).toBeVisible();
  await page.getByLabel("Parolă nouă (minim 8 caractere)").fill("parola-noua-1");
  await page.getByLabel("Repetă parola").fill("altceva-123");
  await page.getByRole("button", { name: "Salvează parola" }).click();
  await expect(page.getByRole("alert")).toHaveText("Cele două parole nu sunt la fel.");

  await page.getByLabel("Repetă parola").fill("parola-noua-1");
  await page.getByRole("button", { name: "Salvează parola" }).click();
  await expect(page.getByText("Parola a fost salvată.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin$/);
  expect(db.passwordChanges[0]).toMatchObject({ password: "parola-noua-1" });
});

test("an expired email link explains what to do", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "editor" });
  await page.goto("/admin/set-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired");
  await expect(page.getByRole("heading", { name: "Link expirat" })).toBeVisible();
  await expect(page.getByText("Linkul din email a expirat sau a fost deja folosit.", { exact: false })).toBeVisible();
});

test("a gateway login refusal points to the Verify JWT setting", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "admin" });
  await page.route("**/functions/v1/invite-user", (route) =>
    route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ code: 401, message: "Invalid JWT" }) }),
  );
  await login(page);
  await page.goto("/admin/users");
  await page.getByLabel("Email *").fill("ana2@test.local");
  await page.getByRole("button", { name: "Trimite invitația" }).click();
  await expect(page.getByRole("alert")).toContainText("dezactivează opțiunea „Verify JWT”");
});

test("a person deactivated while signed in is stopped at their next click", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await expect(page.getByRole("heading", { name: "Evenimentele mele" })).toBeVisible();

  db.staff[0].active = false; // an admin deactivates this account meanwhile
  await page.getByRole("link", { name: "Adaugă eveniment" }).click();
  await expect(page.getByRole("heading", { name: "Cont inactiv" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ieșire" })).toBeVisible();
});

test("a deactivation also applies when coming back to the tab", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await expect(page.getByRole("heading", { name: "Evenimentele mele" })).toBeVisible();

  db.staff[0].active = false;
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByRole("heading", { name: "Cont inactiv" })).toBeVisible();
});

test("a role change applies without logging in again", async ({ page }) => {
  const db = await mockSupabase(page, "ok", { role: "admin" });
  await login(page);
  await expect(page.getByRole("link", { name: "Utilizatori" })).toBeVisible();
  db.staff[0].role = "editor"; // demoted by another admin
  await page.getByRole("link", { name: "Contul meu" }).click();
  await expect(page.getByRole("link", { name: "Utilizatori" })).toHaveCount(0);
  await page.getByRole("link", { name: "Evenimente", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Evenimentele mele" })).toBeVisible();
});

test("everyone can change their own name in 'Contul meu'", async ({ page }, testInfo) => {
  const db = await mockSupabase(page, "ok", { role: "editor" });
  await login(page);
  await page.getByRole("link", { name: "Contul meu" }).click();
  await expect(page.getByRole("heading", { name: "Contul meu" })).toBeVisible();
  await expect(page.getByText(`${TEST_EMAIL} · Editor`)).toBeVisible();
  const field = page.getByLabel("Numele tău");
  await expect(field).toHaveValue("Editor Test");
  // nothing to save until it changes
  await expect(page.getByRole("button", { name: "Salvează numele" })).toBeDisabled();

  await field.fill("  Ana Popescu ");
  await page.getByRole("button", { name: "Salvează numele" }).click();
  await expect(page.getByText("Numele a fost salvat.")).toBeVisible();
  expect(db.nameChanges).toEqual(["Ana Popescu"]);
  if (testInfo.project.name === "desktop") {
    await expect(page.getByRole("banner").getByText("Ana Popescu")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/admin-account-desktop.png" });
  }
});

test("admins see who added each event", async ({ page }) => {
  await mockSupabase(page, "ok", { role: "admin" });
  await login(page);
  await expect(page.getByText("adăugat de Ana Editor").locator("visible=true").first()).toBeVisible();
});
