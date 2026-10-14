export type SearchResultKind = "page" | "account";

export interface SearchResult {
    id: string;
    kind: SearchResultKind;
    title: string;
    subtitle: string;
    keywords: string;
    navigateTo: string;
}

export type SearchAccount = {
    name: string;
    email: string;
    accountType: string;
};

const pages: SearchResult[] = [
    {
        id: "page-dashboard",
        kind: "page",
        title: "Dashboard",
        subtitle: "Overview of spending",
        keywords: "home overview summary",
        navigateTo: "dashboard",
    },
    {
        id: "page-summary",
        kind: "page",
        title: "Spending summary",
        subtitle: "Totals, average, and top category",
        keywords: "spent total transactions average cards",
        navigateTo: "spending-summary",
    },
    {
        id: "page-category",
        kind: "page",
        title: "Spending by category",
        subtitle: "Groceries, entertainment, transport, and more",
        keywords: "groceries entertainment transportation dinning dining shopping utilities categories",
        navigateTo: "spending-by-category",
    },
    {
        id: "page-trends",
        kind: "page",
        title: "Monthly spending trends",
        subtitle: "Spending across recent months",
        keywords: "trends months chart history",
        navigateTo: "monthly-trends",
    },
    {
        id: "page-transactions",
        kind: "page",
        title: "Transactions",
        subtitle: "Merchants, categories, and amounts",
        keywords: "transactions checkers shell uber eats takealot woolworths gautrain payments",
        navigateTo: "transactions",
    },
    {
        id: "page-goals",
        kind: "page",
        title: "Spending goals",
        subtitle: "Budgets, on track, warning, and over budget",
        keywords: "goals budget on track warning over",
        navigateTo: "spending-goals",
    },
    {
        id: "page-profile",
        kind: "page",
        title: "My Profile",
        subtitle: "Account details",
        keywords: "profile account settings user",
        navigateTo: "profile",
    },
];

function accountResult(account: SearchAccount): SearchResult {
    return {
        id: "account-current",
        kind: "account",
        title: account.name || "User",
        subtitle: [account.accountType, account.email].filter(Boolean).join(" · "),
        keywords: [account.name, account.email, account.accountType, "my profile", "account"].join(" "),
        navigateTo: "profile",
    };
}

export function globalSearch(query: string, account?: SearchAccount | null, limit = 8): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const tokens = q.split(/\s+/).filter(Boolean);
    const searchIndex = account ? [...pages, accountResult(account)] : pages;

    return searchIndex
        .map((item) => {
            const title = item.title.toLowerCase();
            const haystack = `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase();
            const score = tokens.reduce((sum, token) => {
                if (title.includes(token)) return sum + 3;
                if (haystack.includes(token)) return sum + 1;
                return sum;
            }, 0);
            return { item, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
        .slice(0, limit)
        .map(({ item }) => item);
}

export function kindLabel(kind: SearchResultKind): string {
    return kind === "account" ? "Account" : "Page";
}
