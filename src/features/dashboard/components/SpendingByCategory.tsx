import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DateRangeFilter, defaultDateRange, formatDayLabel, presetForRange, type DateRange } from "../../../components/DateRangeFilter";
import { isApiConfigured } from "../../../services/api";
import { categoryCatalog, mockSpendingForRange } from "../../../mockData";
import { fetchCategoryFilter, fetchSpendingByCategory, type ApiSpendingByCategory } from "../services/dashboardApi";
import { categoryIcon } from "./CategoryFilter";

const money = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
});

type CategoryRow = {
    name: string;
    amount: number;
    transactionsCount: number;
    color: string;
    icon?: string;
};

function mergeCategories(
    catalog: { name?: string; color?: string; icon?: string }[],
    spending: ApiSpendingByCategory | null
): CategoryRow[] {
    const spent = new Map((spending?.categories ?? []).map((item) => [item.name.toLowerCase(), item]));
    const seen = new Set<string>();
    const rows: CategoryRow[] = catalog.flatMap((category) => {
        const name = category.name?.trim();
        if (!name) return [];
        seen.add(name.toLowerCase());
        const match = spent.get(name.toLowerCase());
        return [
            {
                name,
                amount: match?.amount ?? 0,
                transactionsCount: match?.transactionsCount ?? 0,
                color: category.color || match?.color || "var(--primary)",
                icon: category.icon || match?.icon,
            },
        ];
    });

    for (const item of spending?.categories ?? []) {
        if (seen.has(item.name.toLowerCase())) continue;
        rows.push({
            name: item.name,
            amount: item.amount,
            transactionsCount: item.transactionsCount,
            color: item.color || "var(--primary)",
            icon: item.icon,
        });
    }

    return rows;
}

function withSpend(rows: CategoryRow[]) {
    return rows.filter((row) => row.amount > 0 || row.transactionsCount > 0);
}

export function SpendingByCategory({ customerId = 1 }: { customerId?: number }) {
    const [range, setRange] = useState<DateRange>(defaultDateRange);
    const [rows, setRows] = useState<CategoryRow[]>(() =>
        isApiConfigured() ? [] : withSpend(mergeCategories(categoryCatalog, mockSpendingForRange(defaultDateRange())))
    );
    const [loading, setLoading] = useState(() => isApiConfigured());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isApiConfigured()) {
            setRows(withSpend(mergeCategories(categoryCatalog, mockSpendingForRange(range))));
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const preset = presetForRange(range);
        Promise.all([
            fetchCategoryFilter(customerId).catch(() => ({ categories: categoryCatalog })),
            fetchSpendingByCategory(customerId, preset === "custom" ? undefined : preset, {
                startDate: range.startDate,
                endDate: range.endDate,
            }),
        ])
            .then(([catalog, spending]) => {
                if (cancelled) return;
                const categories = catalog.categories?.length ? catalog.categories : categoryCatalog;
                setRows(withSpend(mergeCategories(categories, spending)));
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "";
                setRows([]);
                setError(message === "API unreachable" ? message : "Could not load spending by category.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId, range.startDate, range.endDate]);

    const categories = rows;
    const total = categories.reduce((sum, item) => sum + item.amount, 0);

    return (
        <>
            <div className="section-header ops-dash-header">
                <div>
                    <h2 className="ops-dash-title">Spending by category</h2>
                    <p className="ops-dash-subtitle">
                        {range.startDate || range.endDate
                            ? `Totals from ${range.startDate ? formatDayLabel(range.startDate) : "the start"} to ${range.endDate ? formatDayLabel(range.endDate) : "today"}.`
                            : "How spending is split across categories."}
                    </p>
                </div>
                <DateRangeFilter value={range} onChange={setRange} />
            </div>

            {loading && <p className="settings-hint">Loading categories…</p>}
            {error && (
                <p className="add-users-alert add-users-alert--error" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <section className="dash-panel">
                    <p className="dash-panel-total">
                        Total <strong>{money.format(total)}</strong>
                    </p>
                    {categories.length === 0 ? (
                        <p className="settings-hint">No categories in this range.</p>
                    ) : (
                        <ul className="category-list">
                            {categories.map((category) => {
                                const share = total > 0 ? Math.min(100, (category.amount / total) * 100) : 0;
                                return (
                                    <li key={category.name} className="category-row">
                                        <div className="category-row-head">
                                            <span className="category-name">
                                                {categoryIcon(category.icon) ? (
                                                    <FontAwesomeIcon
                                                        icon={categoryIcon(category.icon)!}
                                                        style={{ color: category.color }}
                                                    />
                                                ) : (
                                                    <span
                                                        className="category-swatch"
                                                        style={{ background: category.color || "var(--primary)" }}
                                                    />
                                                )}
                                                {category.name}
                                            </span>
                                            <strong>{money.format(category.amount)}</strong>
                                        </div>
                                        <div className="category-track" aria-hidden="true">
                                            <span
                                                className="category-fill"
                                                style={{
                                                    width: `${share}%`,
                                                    background: category.color || "var(--primary)",
                                                }}
                                            />
                                        </div>
                                        <p className="category-meta">
                                            {category.transactionsCount.toLocaleString("en-ZA")} transactions · {share.toFixed(0)}%
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            )}
        </>
    );
}
