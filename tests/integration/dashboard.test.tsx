import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

describe("dashboard", () => {
    it("shows the mock summary and opens the related tab from each card", async () => {
        const user = userEvent.setup();
        render(<App />);

        expect(screen.getByRole("heading", { name: "Spending summary" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Total spent/ })).toBeInTheDocument();
        expect(screen.queryByLabelText("From")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Total spent/ }));
        expect(screen.getByRole("heading", { name: "Monthly spending trends" })).toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Spending summary" }));
        await user.click(screen.getByRole("button", { name: /Average transaction/ }));
        expect(screen.getByRole("heading", { name: "Transactions" })).toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Spending summary" }));
        await user.click(screen.getByRole("button", { name: /Top category/ }));
        expect(screen.getByRole("heading", { name: "Spending by category" })).toBeInTheDocument();
        const categories = screen.getByRole("list");
        for (const name of ["Groceries", "Entertainment", "Transportation", "Dinning", "Shopping", "utilities"]) {
            expect(within(categories).getByText(name)).toBeInTheDocument();
        }

        await user.click(screen.getByRole("button", { name: "Today" }));
        expect(screen.getByText("No categories in this range.")).toBeInTheDocument();
        expect(screen.queryByText("Entertainment")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "7 days" }));
        expect(screen.getByText("Groceries")).toBeInTheDocument();
        expect(screen.queryByText("Entertainment")).not.toBeInTheDocument();
    });

    it("filters the spending summary with the date presets", async () => {
        const user = userEvent.setup();
        render(<App />);

        expect(screen.getByRole("button", { name: /Total spent/ })).toHaveTextContent(/18[\s\u00a0\u202f]*420,50/);
        expect(screen.getByRole("button", { name: /Top category/ })).toHaveTextContent("Groceries");

        await user.click(screen.getByRole("button", { name: "Today" }));
        expect(screen.getByRole("button", { name: /Total spent/ })).toHaveTextContent(/0,00/);
        expect(screen.getByRole("button", { name: /Transactions/ })).toHaveTextContent(/^0/);

        await user.click(screen.getByRole("button", { name: "7 days" }));
        expect(screen.getByRole("button", { name: /Total spent/ })).toHaveTextContent(/8[\s\u00a0\u202f]*570,50/);
        expect(screen.getByRole("button", { name: /Top category/ })).toHaveTextContent("Dinning");
    });

    it("filters transactions by category and pages the mock list", async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole("tab", { name: "Transactions" }));
        expect(screen.getByLabelText("From")).toBeInTheDocument();
        expect(screen.getByText("Checkers")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Entertainment" }));
        expect(screen.getByText("Ster-Kinekor")).toBeInTheDocument();
        expect(screen.queryByText("Checkers")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "All" }));
        expect(screen.getByText("Checkers")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Sort Date ascending" }));
        let merchants = screen.getAllByRole("row").map((row) => row.textContent);
        expect(merchants.findIndex((text) => text?.includes("Pick n Pay"))).toBeLessThan(
            merchants.findIndex((text) => text?.includes("Checkers"))
        );

        await user.click(screen.getByRole("button", { name: "Sort Amount descending" }));
        merchants = screen.getAllByRole("row").map((row) => row.textContent);
        expect(merchants[1]).toContain("City Power");
    });

    it("shows on track, warning, and over budget together", async () => {
        const user = userEvent.setup();
        render(<App/>);

        await user.click(screen.getByRole("tab", { name: "Spending Goals" }));

        const statuses = screen.getByRole("list");
        expect(within(statuses).getByText("On track")).toBeInTheDocument();
        expect(within(statuses).getByText("Warning")).toBeInTheDocument();
        expect(within(statuses).getByText("Over budget")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: "Groceries" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: "Entertainment" })).toBeInTheDocument();
    });
});
