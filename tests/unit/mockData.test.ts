import { describe, expect, it } from "vitest";
import {
    categoryCatalog,
    mockGoals,
    mockProfile,
    mockSpending,
    mockSummary,
    mockTransactions,
    mockTrends,
} from "../../src/mockData";

describe("mock data", () => {
    it("keeps a profile the screens can share", () => {
        expect(mockProfile).toMatchObject({
            name: "Siviwe",
            email: "siviwe@capitecbank.co.za",
            currency: "ZAR",
        });
    });

    it("lists every spending category", () => {
        expect(categoryCatalog.map((category) => category.name)).toEqual([
            "Groceries",
            "Entertainment",
            "Transportation",
            "Dinning",
            "Shopping",
            "utilities",
        ]);
    });

    it("aligns the latest trend and category total with the summary", () => {
        const categoryTotal = (mockSpending.categories ?? []).reduce((sum, category) => sum + category.amount, 0);

        expect(mockSpending.totalAmount).toBeCloseTo(categoryTotal);
        expect(mockSummary.totalSpent).toBe(18420.5);
        expect(mockTrends.trends?.at(-1)?.totalSpent).toBe(mockSummary.totalSpent);
        expect(mockTrends.trends?.at(-1)?.transactionsCount).toBe(mockSummary.transactionsCount);
    });

    it("uses category names the transaction filter can match", () => {
        const names = new Set(categoryCatalog.map((category) => category.name));
        for (const transaction of mockTransactions) {
            expect(names.has(transaction.category)).toBe(true);
        }
    });

    it("includes on track, warning, and over budget goals", () => {
        const statuses = (mockGoals.goals ?? []).map((goal) => goal.status);
        expect(statuses).toContain("On track");
        expect(statuses).toContain("Warning");
        expect(statuses).toContain("Over budget");
    });
});
