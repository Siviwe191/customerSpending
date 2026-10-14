import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { mockProfile } from "../../src/mockData";

describe("profile", () => {
    it("opens the account menu and shows the profile details", async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole("button", { name: "Account" }));
        expect(screen.getByRole("menu")).toBeInTheDocument();

        await user.click(screen.getByRole("menuitem", { name: "View profile" }));

        expect(screen.getByRole("heading", { level: 1, name: "My Profile" })).toBeInTheDocument();
        expect(screen.getByText("Account information")).toBeInTheDocument();
        expect(screen.getAllByText(mockProfile.email).length).toBeGreaterThan(0);
        expect(screen.getByText("ZAR")).toBeInTheDocument();
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes the account menu with Escape", async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole("button", { name: "Account" }));
        await user.keyboard("{Escape}");

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Spending summary" })).toBeInTheDocument();
    });
});
