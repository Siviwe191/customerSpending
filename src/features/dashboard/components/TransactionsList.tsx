import { useEffect, useState } from "react";
import { DateRangeFilter, defaultDateRange, formatDayLabel, type DateRange } from "../../../components/DateRangeFilter";
import { apiErrorMessage, isApiConfigured } from "../../../services/api";
import { mockTransactions } from "../../../mockData";
import { CategoryFilter } from "./CategoryFilter";
import { fetchTransactions, type ApiTransactions } from "../services/dashboardApi";

const PAGE_SIZE = 8;

type TransactionSort = "date_asc" | "date_desc" | "amount_asc" | "amount_desc";

function sortTransactions<T extends { date: string; amount: number }>(items: T[], sort: TransactionSort) {
    return [...items].sort((a, b) => {
        if (sort === "date_asc") return a.date.localeCompare(b.date) || a.amount - b.amount;
        if (sort === "date_desc") return b.date.localeCompare(a.date) || b.amount - a.amount;
        if (sort === "amount_asc") return a.amount - b.amount || a.date.localeCompare(b.date);
        return b.amount - a.amount || b.date.localeCompare(a.date);
    });
}

function SortChevron({ direction }: { direction: "up" | "down" }) {
    return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
                d={direction === "up" ? "M2 6.5 5 3.5 8 6.5" : "M2 3.5 5 6.5 8 3.5"}
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ColumnSort({
    label,
    sort,
    asc,
    desc,
    onSort,
}: {
    label: string;
    sort: TransactionSort;
    asc: TransactionSort;
    desc: TransactionSort;
    onSort: (next: TransactionSort) => void;
}) {
    return (
        <span className="tx-col-sort">
            {label}
            <span className="tx-chevrons">
                <button
                    type="button"
                    className={`tx-chevron${sort === asc ? " is-active" : ""}`}
                    aria-label={`Sort ${label} ascending`}
                    aria-pressed={sort === asc}
                    onClick={() => onSort(asc)}
                >
                    <SortChevron direction="up" />
                </button>
                <button
                    type="button"
                    className={`tx-chevron${sort === desc ? " is-active" : ""}`}
                    aria-label={`Sort ${label} descending`}
                    aria-pressed={sort === desc}
                    onClick={() => onSort(desc)}
                >
                    <SortChevron direction="down" />
                </button>
            </span>
        </span>
    );
}

const money = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
});

function formatWhen(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return value;
    return new Date(year, month - 1, day).toLocaleDateString("en-ZA", { dateStyle: "medium" });
}

export function TransactionsList({ customerId = 1 }: { customerId?: number }) {
    const [range, setRange] = useState<DateRange>(defaultDateRange);
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState<TransactionSort>("date_desc");
    const [offset, setOffset] = useState(0);
    const [data, setData] = useState<ApiTransactions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setOffset(0);
    }, [range.startDate, range.endDate, category, sort]);

    useEffect(() => {
        if (!isApiConfigured()) {
            const filtered = sortTransactions(
                mockTransactions.filter((item) => {
                    if (range.startDate && item.date < range.startDate) return false;
                    if (range.endDate && item.date > range.endDate) return false;
                    if (category && item.category?.toLowerCase() !== category.toLowerCase()) return false;
                    return true;
                }),
                sort
            );
            setData({
                limit: PAGE_SIZE,
                offset,
                category,
                transactions: filtered.slice(offset, offset + PAGE_SIZE),
            });
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchTransactions(
            customerId,
            PAGE_SIZE,
            offset,
            category.trim() || undefined,
            { startDate: range.startDate, endDate: range.endDate },
            sort
        )
            .then((payload) => {
                if (!cancelled) setData(payload);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setData(null);
                setError(apiErrorMessage(err, "Could not load transactions."));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId, range.startDate, range.endDate, category, sort, offset]);

    const transactions = data?.transactions ?? [];
    const canGoBack = offset > 0;
    const canGoForward = transactions.length === PAGE_SIZE;

    return (
        <>
            <div className="section-header ops-dash-header">
                <div>
                    <h2 className="ops-dash-title">Transactions</h2>
                    <p className="ops-dash-subtitle">
                        {range.startDate || range.endDate
                            ? `From ${range.startDate ? formatDayLabel(range.startDate) : "the start"} to ${range.endDate ? formatDayLabel(range.endDate) : "today"}.`
                            : "Recent account transactions."}
                    </p>
                </div>
                <DateRangeFilter value={range} onChange={setRange} />
            </div>

            <CategoryFilter customerId={customerId} value={category} onChange={setCategory} />

            {loading && <p className="settings-hint">Loading transactions…</p>}
            {error && (
                <p className="add-users-alert add-users-alert--error" role="alert">
                    {error}
                </p>
            )}

            {data && (
                <section className="dash-panel">
                    {transactions.length === 0 ? (
                        <p className="settings-hint">No transactions in this range.</p>
                    ) : (
                        <div className="tx-table-wrap">
                            <table className="tx-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <ColumnSort label="Date" sort={sort} asc="date_asc" desc="date_desc" onSort={setSort} />
                                        </th>
                                        <th>Merchant</th>
                                        <th>Category</th>
                                        <th>
                                            <ColumnSort label="Amount" sort={sort} asc="amount_asc" desc="amount_desc" onSort={setSort} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((item) => (
                                        <tr key={item.id ?? `${item.date}-${item.merchant}-${item.amount}`}>
                                            <td>{formatWhen(item.date)}</td>
                                            <td>
                                                <strong>{item.merchant || "—"}</strong>
                                                {item.description ? <span>{item.description}</span> : null}
                                            </td>
                                            <td>{item.category || "—"}</td>
                                            <td className="tx-amount">{money.format(item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="tx-pager">
                        <button type="button" className="dash-page-btn" disabled={!canGoBack} onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}>
                            Previous
                        </button>
                        <button type="button" className="dash-page-btn" disabled={!canGoForward} onClick={() => setOffset((value) => value + PAGE_SIZE)}>
                            Next
                        </button>
                    </div>
                </section>
            )}
        </>
    );
}
