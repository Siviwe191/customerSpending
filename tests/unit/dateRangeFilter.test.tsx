import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateRangeFilter } from "../../src/components/DateRangeFilter";

describe("DateRangeFilter", () => {
    it("starts on the 30 day preset and hides the date pickers when presetsOnly is set", () => {
        render(<DateRangeFilter presetsOnly />);

        expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByLabelText("From")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("To")).not.toBeInTheDocument();
    });

    it("selects a preset and reports that range", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<DateRangeFilter onChange={onChange} />);

        await user.click(screen.getByRole("button", { name: "Today" }));

        expect(onChange).toHaveBeenCalledTimes(1);
        const next = onChange.mock.calls[0][0] as { startDate: string; endDate: string };
        expect(next.startDate).toBe(next.endDate);
        expect(screen.getByRole("button", { name: "Today" })).toHaveAttribute("aria-pressed", "true");
    });

    it("keeps From and To when presetsOnly is off", () => {
        render(<DateRangeFilter value={{ startDate: "2026-01-01", endDate: "2026-01-31" }} onChange={vi.fn()} />);

        expect(screen.getByLabelText("From")).toHaveValue("2026-01-01");
        expect(screen.getByLabelText("To")).toHaveValue("2026-01-31");
        expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute("aria-pressed", "false");
    });
});
