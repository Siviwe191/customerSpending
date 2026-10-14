import { describe, expect, it } from "vitest";
import { defaultDateRange, formatDayLabel } from "../../src/components/DateRangeFilter";

function iso(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

describe("date range helpers", () => {
    it("defaults to an inclusive 30 day range ending today", () => {
        const today = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 29);

        expect(defaultDateRange()).toEqual({ startDate: iso(from), endDate: iso(today) });
    });

    it("formats a calendar day for display", () => {
        const label = formatDayLabel("2026-03-12");
        expect(label).toMatch(/12/);
        expect(label).toMatch(/2026/);
    });

    it("leaves an invalid day unchanged", () => {
        expect(formatDayLabel("not-a-date")).toBe("not-a-date");
    });
});
