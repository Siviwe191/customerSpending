let accessToken: string | null = null;

function configuredApiBase(): string {
    return String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
}

export function getApiBaseUrl(): string {
    return configuredApiBase();
}

export function getApiToken(): string | null {
    return accessToken;
}

export function setApiToken(token: string | null) {
    accessToken = token;
}


export function isApiConfigured(): boolean {
    return Boolean(configuredApiBase());
}

type ApiError = Error & { status?: number; body?: unknown };

export default async function request<T>(
    path: string,
    options: RequestInit & { json?: unknown } = {}
): Promise<T> {
    const base = getApiBaseUrl();
    if (!isApiConfigured()) throw Object.assign(new Error("API URL not configured"), { status: 0 });

    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.json !== undefined) {
        headers.set("Content-Type", "application/json");
    }
    const token = getApiToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let res: Response;
    try {
        res = await fetch(`${base}/api${path}`, {
            ...options,
            headers,
            body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
        });
    } catch {
        throw Object.assign(new Error("API unreachable"), { status: 0 });
    }

    if (!res.ok) {
        let body: unknown = null;
        try {
            body = await res.json();
        } catch {
            body = await res.text().catch(() => null);
        }
        const err: ApiError = Object.assign(new Error(`API ${res.status}`), {
            status: res.status,
            body,
        });
        throw err;
    }

    if (res.status === 204) return undefined as T;
    try {
        return (await res.json()) as T;
    } catch {
        throw Object.assign(new Error("API returned non-JSON"), { status: res.status || 0 });
    }
}

export type ApiSpendingSummary = {
    range?: {
        startDate?: string | null;
        endDate?: string | null;
    };
    sp_summary?: {
        totalSpent: number;
        transactionsCount: number;
        averageTransaction: number;
        topCategory: string;
        comparedToPrevious: {
            spentChange: number;
            transactionChange: number;
        };
    };
};

export async function fetchSpendingSummary( customerId:number, range?: {
    startDate?: string;
    endDate?: string;
    period?: string;
}): Promise<ApiSpendingSummary> {
    const params = new URLSearchParams();
    if (range?.period) params.set("period", range.period);
    if (range?.startDate) params.set("startDate", range.startDate);
    if (range?.endDate) params.set("endDate", range.endDate);
    const query = params.toString();
    const path = `/customers/${customerId}/spending/summary${query ? `?${query}` : ""}`;
    return request<ApiSpendingSummary>(path);
}

export type ApiCustomerProfile = {
    customerId?: string | number;
    name?: string;
    email?: string;
    joinDate?: string;
    AccountType?: string;
    totalSpent?: string;
    currency?: string;

};
export async function fetchME( customerId:number): Promise<ApiCustomerProfile> {
    const path = `/customers/${customerId}/profile`;
    return request<ApiCustomerProfile>(path);
}