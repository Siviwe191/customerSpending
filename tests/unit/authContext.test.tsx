import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../../src/context/AuthContext";
import request, { getApiToken, setApiToken } from "../../src/services/api";

function TokenReader() {
    const { accessToken, setAccessToken, clearAccessToken } = useAuth();
    return (
        <div>
            <span>{accessToken ?? "none"}</span>
            <button type="button" onClick={() => setAccessToken("memory-token")}>
                Save token
            </button>
            <button type="button" onClick={clearAccessToken}>
                Clear token
            </button>
        </div>
    );
}

describe("AuthContext", () => {
    afterEach(() => {
        setApiToken(null);
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it("keeps the access token in memory for the component tree and API client", async () => {
        const user = userEvent.setup();
        vi.stubEnv("VITE_API_URL", "http://api.test");
        const fetchMock = vi.fn(async () => Response.json({ ok: true }));
        vi.stubGlobal("fetch", fetchMock);

        render(
            <AuthProvider>
                <TokenReader />
            </AuthProvider>,
        );

        expect(screen.getByText("none")).toBeInTheDocument();
        expect(getApiToken()).toBeNull();

        await user.click(screen.getByRole("button", { name: "Save token" }));
        expect(screen.getByText("memory-token")).toBeInTheDocument();
        expect(getApiToken()).toBe("memory-token");

        await request("/customers/1/profile");
        const headers = fetchMock.mock.calls[0][1].headers as Headers;
        expect(headers.get("Authorization")).toBe("Bearer memory-token");

        await user.click(screen.getByRole("button", { name: "Clear token" }));
        expect(screen.getByText("none")).toBeInTheDocument();
        expect(getApiToken()).toBeNull();
    });

    it("requires the provider", () => {
        expect(() => render(<TokenReader />)).toThrow("useAuth must be used within AuthProvider");
    });
});
