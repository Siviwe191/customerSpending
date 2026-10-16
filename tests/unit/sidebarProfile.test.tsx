import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Sidebar from "../../src/layouts/sidebar";
import { useCustomerProfile } from "../../src/hooks/useCustomerProfile";

function ProfileReader() {
    useCustomerProfile(1);
    return null;
}

describe("sidebar profile", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it("shows the name and email from the profile API", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        vi.stubGlobal("fetch", vi.fn(async () => Response.json({
            name: "Test Customer",
            email: "customer@example.com",
        })));

        render(
            <>
                <Sidebar activeItem="dashboard" setActiveItem={() => undefined} />
                <ProfileReader />
            </>,
        );

        expect(await screen.findByText("customer@example.com")).toBeInTheDocument();
        expect(screen.getByText("Test Customer")).toBeInTheDocument();
        expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
            "http://api.test/api/customers/1/profile",
            expect.objectContaining({ headers: expect.any(Headers) }),
        );
    });
});
