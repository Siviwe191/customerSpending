import type { SpendingSummaryData } from "./features/dashboard/types/types";
import type {
    ApiCategoryFilter,
    ApiSpendingByCategory,
    ApiSpendingGoals,
    ApiSpendingTrends,
    ApiTransactions,
} from "./features/dashboard/services/dashboardApi";

export const mockProfile = {
    name: "Siviwe",
    email: "siviwe@capitecbank.co.za",
    joinDate: "2019-03-12",
    accountType: "Premium",
    totalSpent: 18420.5,
    currency: "ZAR",
};

export const mockSummary: SpendingSummaryData = {
    totalSpent: 18420.5,
    transactionsCount: 47,
    averageTransaction: 391.93,
    topCategory: "Groceries",
    comparedToPrevious: {
        spentChange: 8.4,
        transactionChange: -3.1,
    },
};

export const categoryCatalog: NonNullable<ApiCategoryFilter["categories"]> = [
    { name: "Groceries", color: "#FF6B6B", icon: "shopping-cart" },
    { name: "Entertainment", color: "#4ECDC4", icon: "film" },
    { name: "Transportation", color: "#45B7D1", icon: "car" },
    { name: "Dinning", color: "#F7DC6F", icon: "utensils" },
    { name: "Shopping", color: "#BB8FCE", icon: "shopping-bag" },
    { name: "utilities", color: "#85C1E9", icon: "zap" },
];

export const mockCategories: ApiCategoryFilter = {
    categories: categoryCatalog,
};

const mockSpend: Record<string, { amount: number; transactionsCount: number }> = {
    Groceries: { amount: 6420, transactionsCount: 18 },
    Entertainment: { amount: 980, transactionsCount: 3 },
    Transportation: { amount: 3180, transactionsCount: 9 },
    Dinning: { amount: 2740, transactionsCount: 11 },
    Shopping: { amount: 3000, transactionsCount: 5 },
    utilities: { amount: 2100.5, transactionsCount: 4 },
};

export const mockSpending: ApiSpendingByCategory = {
    totalAmount: Object.values(mockSpend).reduce((sum, item) => sum + item.amount, 0),
    categories: categoryCatalog.flatMap((category) => {
        const name = category.name || "";
        const spend = mockSpend[name];
        if (!spend) return [];
        return [
            {
                name,
                amount: spend.amount,
                transactionsCount: spend.transactionsCount,
                color: category.color || "var(--primary)",
                icon: category.icon || "",
            },
        ];
    }),
};

function monthLabel(offset: number) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - offset);
    return date.toLocaleDateString("en-ZA", { month: "short", year: "numeric" });
}

export const mockTrends: ApiSpendingTrends = {
    trends: [
        { month: monthLabel(5), totalSpent: 14200, transactionsCount: 38, averageTransaction: 373.68 },
        { month: monthLabel(4), totalSpent: 15680, transactionsCount: 41, averageTransaction: 382.44 },
        { month: monthLabel(3), totalSpent: 13940, transactionsCount: 36, averageTransaction: 387.22 },
        { month: monthLabel(2), totalSpent: 16110, transactionsCount: 44, averageTransaction: 366.14 },
        { month: monthLabel(1), totalSpent: 17240, transactionsCount: 45, averageTransaction: 383.11 },
        { month: monthLabel(0), totalSpent: 18420.5, transactionsCount: 47, averageTransaction: 391.93 },
    ],
};

function daysAgo(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export const mockTransactions: NonNullable<ApiTransactions["transactions"]> = [
    { id: "txn_1", date: daysAgo(1), merchant: "Checkers", category: "Groceries", amount: 842.5, description: "Weekly shop",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_2", date: daysAgo(2), merchant: "Shell", category: "Transportation", amount: 650, description: "Fuel",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_3", date: daysAgo(3), merchant: "Uber Eats", category: "Dinning", amount: 186.9, description: "Dinner", paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_4", date: daysAgo(6), merchant: "City Power", category: "utilities", amount: 1240, description: "Electricity", paymentMethod: "Debit order", icon: 0, categoryColor: 0 },
    { id: "txn_5", date: daysAgo(8), merchant: "Woolworths", category: "Groceries", amount: 416.2, description: "Household",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_6", date: daysAgo(12), merchant: "Takealot", category: "Shopping", amount: 899, description: "Online order",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_7", date: daysAgo(15), merchant: "Gautrain", category: "Transportation", amount: 210, description: "Return ticket",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_8", date: daysAgo(18), merchant: "Ster-Kinekor", category: "Entertainment", amount: 180, description: "Cinema",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_9", date: daysAgo(22), merchant: "Dis-Chem", category: "Shopping", amount: 156.75, description: "Pharmacy",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
    { id: "txn_10", date: daysAgo(27), merchant: "Pick n Pay", category: "Groceries", amount: 538.4, description: "Groceries",  paymentMethod: "Card", icon: 0, categoryColor: 0 },
];

export function mockSpendingForRange(range: { startDate: string; endDate: string }): ApiSpendingByCategory {
    const matched = new Map<string, number>();
    const seen = new Map<string, number>();
    for (const item of mockTransactions) {
        const key = item.category?.trim().toLowerCase();
        if (!key) continue;
        seen.set(key, (seen.get(key) ?? 0) + 1);
        const included =
            (!range.startDate || item.date >= range.startDate) &&
            (!range.endDate || item.date <= range.endDate);
        if (included) matched.set(key, (matched.get(key) ?? 0) + 1);
    }

    const coversEveryTransaction = [...seen.entries()].every(([key, count]) => (matched.get(key) ?? 0) === count);
    if (coversEveryTransaction && seen.size > 0) return mockSpending;

    const categories = (mockSpending.categories ?? []).flatMap((category) => {
        const key = category.name.toLowerCase();
        const count = seen.get(key) ?? 0;
        const hits = matched.get(key) ?? 0;
        if (count === 0 || hits === 0) return [];
        return [
            {
                ...category,
                amount: Math.round(category.amount * (hits / count) * 100) / 100,
                transactionsCount: Math.max(1, Math.round(category.transactionsCount * (hits / count))),
            },
        ];
    });

    return {
        totalAmount: categories.reduce((sum, item) => sum + item.amount, 0),
        categories,
    };
}

export function mockSummaryForRange(range: { startDate: string; endDate: string }): SpendingSummaryData {
    const spending = mockSpendingForRange(range);
    if (spending === mockSpending) return mockSummary;

    const categories = spending.categories ?? [];
    const totalSpent = spending.totalAmount ?? 0;
    const transactionsCount = categories.reduce((sum, item) => sum + item.transactionsCount, 0);
    const top = categories.reduce<(typeof categories)[number] | undefined>(
        (best, item) => (!best || item.amount > best.amount ? item : best),
        undefined
    );

    return {
        totalSpent,
        transactionsCount,
        averageTransaction: transactionsCount > 0 ? Math.round((totalSpent / transactionsCount) * 100) / 100 : 0,
        topCategory: top?.name || "—",
        comparedToPrevious: {
            spentChange: 0,
            transactionChange: 0,
        },
    };
}

export const mockGoals: ApiSpendingGoals = {
    goals: [
        { id: "goal-1", category: "Groceries", monthlyBudget: 7000, currentSpent: "6420", percentageUsed: "91.7", daysRemaining: "19", status: "On track" },
        { id: "goal-2", category: "Transport", monthlyBudget: 3500, currentSpent: "3180", percentageUsed: "90.9", daysRemaining: "19", status: "On track" },
        { id: "goal-3", category: "Eating out", monthlyBudget: 2500, currentSpent: "2740", percentageUsed: "109.6", daysRemaining: "19", status: "Over budget" },
        { id: "goal-4", category: "Utilities", monthlyBudget: 2200, currentSpent: "2100.50", percentageUsed: "95.5", daysRemaining: "19", status: "On track" },
        { id: "goal-5", category: "Entertainment", monthlyBudget: 1500, currentSpent: "1260", percentageUsed: "84", daysRemaining: "19", status: "Warning" },
    ],
};
