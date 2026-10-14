import { expect, test } from "@playwright/test";

test("shows mock spending data and moves between dashboard sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Spending summary" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Total spent/ })).toBeVisible();
    await expect(page.getByLabel("From")).toHaveCount(0);

    await page.getByRole("button", { name: /Total spent/ }).click();
    await expect(page.getByRole("heading", { name: "Monthly spending trends" })).toBeVisible();

    await page.getByRole("tab", { name: "Spending by category" }).click();
    const categories = page.getByRole("list");
    await expect(categories.getByText("utilities")).toBeVisible();
    await expect(categories.getByText("Dinning")).toBeVisible();

    await page.getByRole("tab", { name: "Transactions" }).click();
    await expect(page.getByText("Checkers")).toBeVisible();
    await page.getByRole("button", { name: "Entertainment" }).click();
    await expect(page.getByText("Ster-Kinekor")).toBeVisible();
    await expect(page.getByText("Checkers")).toHaveCount(0);

    await page.getByRole("tab", { name: "Spending Goals" }).click();
    const statuses = page.getByRole("list");
    await expect(statuses.getByText("On track")).toBeVisible();
    await expect(statuses.getByText("Warning")).toBeVisible();
    await expect(statuses.getByText("Over budget")).toBeVisible();
});

test("opens the profile from the account menu", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "View profile" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "My Profile" })).toBeVisible();
    await expect(page.getByText("Account information")).toBeVisible();
    await expect(page.getByText("siviwe@capitecbank.co.za").first()).toBeVisible();
});
