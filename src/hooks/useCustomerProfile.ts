import { useEffect, useState } from "react";
import { mockProfile } from "../mockData";
import { fetchME, isApiConfigured, type ApiCustomerProfile } from "../services/api";

export type ProfileView = {
    name: string;
    email: string;
    joinDate: string;
    accountType: string;
    totalSpent: number;
    currency: string;
};

function fromMock(): ProfileView {
    return {
        name: mockProfile.name,
        email: mockProfile.email,
        joinDate: mockProfile.joinDate,
        accountType: mockProfile.accountType,
        totalSpent: mockProfile.totalSpent,
        currency: mockProfile.currency,
    };
}

function fromApi(payload: ApiCustomerProfile): ProfileView {
    const spent = Number(payload.totalSpent);
    return {
        name: payload.name || "User",
        email: payload.email || "",
        joinDate: payload.joinDate || "",
        accountType: payload.AccountType || "",
        totalSpent: Number.isFinite(spent) ? spent : 0,
        currency: payload.currency || "ZAR",
    };
}

export function useCustomerProfile(customerId = 1) {
    const [profile, setProfile] = useState<ProfileView | null>(() => (isApiConfigured() ? null : fromMock()));
    const [loading, setLoading] = useState(() => isApiConfigured());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isApiConfigured()) {
            setProfile(fromMock());
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchME(customerId)
            .then((payload) => {
                if (!cancelled) setProfile(fromApi(payload));
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "";
                setProfile(null);
                setError(message === "API unreachable" ? message : "Could not load profile.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId]);

    return { profile, loading, error };
}
