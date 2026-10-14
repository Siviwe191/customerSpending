import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/api.ts", () => ({
    default: vi.fn(),
}));

import request from "../../src/services/api.ts";
import {
    fetchCategoryFilter,
    fetchSpendingByCategory,
    fetchSpendingGoals,
    fetchSpendingTrends,
    fetchTransactions,
} from "../../src/features/dashboard/services/dashboardApi";

const requestMock = vi.mocked(request);

describe("dashboard API paths", () => {
    beforeEach(() => {
        requestMock.mockReset();
        requestMock.mockResolvedValue({});
    });

    it("sends limit and offset as strings, including offset 0", async () => {
        await fetchTransactions(1, 8, 0, "Groceries", { startDate: "2026-01-01", endDate: "2026-01-31" }, "date");

        expect(requestMock).toHaveBeenCalledWith(
            "/customers/1/spending/transactions?limit=8&offset=0&category=Groceries&startDate=2026-01-01&endDate=2026-01-31&sort=date",
        );
    });

    it("builds the category, trend, goal, and filter paths", async () => {
        await fetchSpendingByCategory(1, "30d", { startDate: "2026-09-01", endDate: "2026-09-30" });
        await fetchSpendingTrends(1, "2026-10");
        await fetchSpendingGoals(4);
        await fetchCategoryFilter(4);

        expect(requestMock).toHaveBeenNthCalledWith(
            1,
            "/customers/1/spending/categories?period=30d&startDate=2026-09-01&endDate=2026-09-30",
        );
        expect(requestMock).toHaveBeenNthCalledWith(2, "/customers/1/spending/trends?month=2026-10");
        expect(requestMock).toHaveBeenNthCalledWith(3, "/customers/4/spending/goals");
        expect(requestMock).toHaveBeenNthCalledWith(4, "/customers/4/filters");
    });
});
