import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChangeHint } from "../../src/components/ChangeHint";

describe("ChangeHint", () => {
    it("shows an up arrow for a positive change", () => {
        const { container } = render(<ChangeHint value={8.4} />);

        expect(screen.getByText("+8.4% vs previous")).toBeInTheDocument();
        expect(container.querySelector(".kpi-change-arrow--up")).toBeTruthy();
    });

    it("shows a down arrow for a negative change", () => {
        const { container } = render(<ChangeHint value={-3.1} />);

        expect(screen.getByText("-3.1% vs previous")).toBeInTheDocument();
        expect(container.querySelector(".kpi-change-arrow--down")).toBeTruthy();
    });

    it("omits the arrow when there is no change", () => {
        const { container } = render(<ChangeHint value={0} />);

        expect(screen.getByText("0.0% vs previous")).toBeInTheDocument();
        expect(container.querySelector(".kpi-change-arrow")).toBeNull();
    });
});
