import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Profile from "../../src/pages/Profile";

describe("Profile page", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it("shows the profile returned by fetchME", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        vi.stubGlobal("fetch", vi.fn(async () => Response.json({
            name: "Test Customer",
            email: "customer@example.com",
            joinDate: "2020-01-02",
            AccountType: "Global One",
            totalSpent: "100.5",
            currency: "ZAR",
        })));

        render(<Profile customerId={3} />);

        expect((await screen.findAllByText("Test Customer")).length).toBeGreaterThan(0);
        expect(screen.getAllByText("customer@example.com").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Global One").length).toBeGreaterThan(0);
        expect(screen.getByText("ZAR")).toBeInTheDocument();
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
            "http://api.test/api/customers/3/profile",
            expect.objectContaining({ headers: expect.any(Headers) }),
        );
    });
});
