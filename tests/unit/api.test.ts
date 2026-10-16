import { afterEach, describe, expect, it, vi } from "vitest";
import request, { apiErrorMessage, fetchME, fetchSpendingSummary, getApiBaseUrl, isApiConfigured } from "../../src/services/api";

describe("API client", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it("is unconfigured until VITE_API_URL is set", async () => {
        expect(isApiConfigured()).toBe(false);
        expect(getApiBaseUrl()).toBe("");
        await expect(request("/customers/1/spending/summary")).rejects.toThrow("API URL not configured");
    });

    it("requests the spending summary with the date query", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test/");
        const fetchMock = vi.fn(async () => Response.json({ sp_summary: { totalSpent: 10 } }));
        vi.stubGlobal("fetch", fetchMock);

        await fetchSpendingSummary(2, { startDate: "2026-01-01", endDate: "2026-01-31" });

        expect(fetchMock).toHaveBeenCalledWith(
            "http://api.test/api/customers/2/spending/summary?startDate=2026-01-01&endDate=2026-01-31",
            expect.objectContaining({
                headers: expect.any(Headers),
            }),
        );
    });

    it("requests the signed-in customer profile", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        const fetchMock = vi.fn(async () => Response.json({ name: "User" }));
        vi.stubGlobal("fetch", fetchMock);

        await fetchME(1);

        expect(fetchMock).toHaveBeenCalledWith(
            "http://api.test/api/customers/1/profile",
            expect.objectContaining({
                headers: expect.any(Headers),
            }),
        );
    });

    it("reports an unreachable API when fetch fails", async () => {
        vi.stubEnv("VITE_API_URL", "http://api.test");
        vi.stubGlobal("fetch", vi.fn(async () => {
            throw new Error("offline");
        }));

        await expect(request("/health")).rejects.toThrow("API unreachable");
    });

    it("keeps 401 and 500 as different messages", () => {
        const fallback = "Could not load spending summary.";
        expect(apiErrorMessage(Object.assign(new Error("API 401"), { status: 401 }), fallback)).toBe(
            "Could not load spending summary. Not authorized (401).",
        );
        expect(apiErrorMessage(Object.assign(new Error("API 500"), { status: 500 }), fallback)).toBe(
            "Could not load spending summary. Server error (500).",
        );
    });
});
