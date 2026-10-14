import { describe, expect, it } from "vitest";
import { globalSearch } from "../../src/utils/globalSearch";

const account = {
    name: "User",
    email: "user@capitecbank.co.za",
    accountType: "Premium",
};

describe("globalSearch", () => {
    it("returns nothing for a blank query", () => {
        expect(globalSearch("   ", account)).toEqual([]);
    });

    it("ranks a page title match ahead of a keyword match", () => {
        const results = globalSearch("transactions", account);
        expect(results[0]?.title).toBe("Transactions");
        expect(results[0]?.navigateTo).toBe("transactions");
    });

    it("finds the signed-in account by email", () => {
        const results = globalSearch("user@capitecbank.co.za", account);
        expect(results.some((result) => result.kind === "account" && result.navigateTo === "profile")).toBe(true);
    });

    it("limits the number of results", () => {
        expect(globalSearch("s", account, 2)).toHaveLength(2);
    });
});
