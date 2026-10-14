import request from '../../../services/api.ts';

export type ApiSpendingByCategory = {
    period?: number | string;
    date_range?: {
        startDate?: string | null;
        endDate?: string | null;
    };
    totalAmount?: number;
    categories?: {
        name: string;
        amount: number;
        transactionsCount: number;
        color: string;
        icon: string;
    }[];
};
export async function fetchSpendingByCategory( customerId:number, period? : string, date_range?: {
    startDate?: string;
    endDate?: string;
}): Promise<ApiSpendingByCategory> {
    const params = new URLSearchParams();
    if (period) params.set("period", period);
    if (date_range?.startDate) params.set("startDate", date_range.startDate);
    if (date_range?.endDate) params.set("endDate", date_range.endDate);
    const query = params.toString();
    const path = `/customers/${customerId}/spending/categories${query ? `?${query}` : ""}`;
    return request<ApiSpendingByCategory>(path);
}

export type ApiSpendingTrends = {
    trends?: {
        month?: string;
       totalSpent:number;
       transactionsCount:number;
       averageTransaction:number;
    }[];
};
export async function fetchSpendingTrends( customerId:number, month?: string): Promise<ApiSpendingTrends> {
    const params = new URLSearchParams();
    if (month) params.set("month",month);
    const query = params.toString();
    const path = `/customers/${customerId}/spending/trends${query ? `?${query}` : ""}`;
    return request<ApiSpendingTrends>(path);
}


export type ApiTransactions = {
    limit?: number;
     offset?: number;
     category?: string;
     date_range?: {
        startDate?: string | null;
        endDate?: string | null;
    };
     sortBy?: string;
    transactions?: {
        id?: string;
        date:string;
        merchant?: string;
        category?: string;
        amount:number;
        description?: string;
        status?: string;
        paymentMethod?: string;
        icon:number;
        categoryColor:number;
    }[];
};

export async function fetchTransactions(customerId: number, limit?: number, offset?: number, category?: string, date_range?: {
    startDate?: string | null;
    endDate?: string | null;
    }, sortBy?: string): Promise<ApiTransactions> {
    const params = new URLSearchParams();
    if (limit != null) params.set("limit", String(limit));
    if (offset != null) params.set("offset", String(offset));
    if (category) params.set("category",category);
    if (date_range?.startDate) params.set("startDate",date_range.startDate);
    if (date_range?.endDate) params.set("endDate",date_range.endDate);
    if (sortBy) params.set("sort",sortBy);

    const query = params.toString();
    const path = `/customers/${customerId}/spending/transactions${query ? `?${query}` : ""}`;
    return request<ApiTransactions>(path);
}

export type ApiSpendingGoals = {
    goals?: {
        id?: string;
        category?: string;
        monthlyBudget:number;
        currentSpent?: string;
        percentageUsed?: string;
        daysRemaining?: string;
        status?: string;
    }[];
};
export async function fetchSpendingGoals( customerId:number): Promise<ApiSpendingGoals> {
    const path = `/customers/${customerId}/spending/goals`;
    return request<ApiSpendingGoals>(path);
}

export type ApiCategoryFilter = {
    categories?: {
        name?: string;
        color?: string;
        icon?: string;
    }[];
};
export async function fetchCategoryFilter( customerId:number): Promise<ApiCategoryFilter> {
    const path = `/customers/${customerId}/filters`;
    return request<ApiCategoryFilter>(path);
}