import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";
import { mockProfile } from "../../src/mockData";

describe("global search", () => {
    it("jumps to a dashboard section and to the profile", async () => {
        const user = userEvent.setup();
        render(<App />);

        const search = screen.getByRole("combobox", { name: "Search" });
        await user.type(search, "goals");
        await user.click(screen.getByRole("option", { name: /Spending goals/ }));

        expect(screen.getByRole("heading", { name: "Spending goals" })).toBeInTheDocument();
        expect(search).toHaveValue("");

        await user.type(search, mockProfile.email);
        await user.click(screen.getByRole("option", { name: /Account/ }));

        expect(screen.getByRole("heading", { level: 1, name: "My Profile" })).toBeInTheDocument();
    });

    it("shows an empty state and closes with Escape", async () => {
        const user = userEvent.setup();
        render(<App />);

        const search = screen.getByRole("combobox", { name: "Search" });
        await user.type(search, "zzzz-not-a-page");

        expect(screen.getByText(/No matches for/)).toBeInTheDocument();
        await user.keyboard("{Escape}");
        expect(screen.queryByText(/No matches for/)).not.toBeInTheDocument();
    });
});
