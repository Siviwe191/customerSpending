import { useEffect, useState } from "react";
import { mockProfile } from "../mockData";
import { apiErrorMessage, fetchME, isApiConfigured, type ApiCustomerProfile } from "../services/api";

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

const profileCache = new Map<number, ProfileView>();
const profileRequests = new Map<number, Promise<ProfileView>>();

export function resetCustomerProfileCache() {
    profileCache.clear();
    profileRequests.clear();
}

function loadCustomerProfile(customerId: number): Promise<ProfileView> {
    const cached = profileCache.get(customerId);
    if (cached) return Promise.resolve(cached);

    const pending = profileRequests.get(customerId);
    if (pending) return pending;

    const request = fetchME(customerId)
        .then((payload) => {
            const profile = fromApi(payload);
            profileCache.set(customerId, profile);
            return profile;
        })
        .finally(() => {
            profileRequests.delete(customerId);
        });
    profileRequests.set(customerId, request);
    return request;
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

        const cached = profileCache.get(customerId);
        if (cached) {
            setProfile(cached);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        loadCustomerProfile(customerId)
            .then((profile) => {
                if (!cancelled) setProfile(profile);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setProfile(null);
                setError(apiErrorMessage(err, "Could not load profile."));
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
