import { useEffect, useState } from "react";
import { DateRangeFilter, defaultDateRange, formatDayLabel, type DateRange } from "../../../components/DateRangeFilter";
import { isApiConfigured } from "../../../services/api";
import { mockTransactions } from "../../../mockData";
import { CategoryFilter } from "./CategoryFilter";
import { fetchTransactions, type ApiTransactions } from "../services/dashboardApi";

const PAGE_SIZE = 20;

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
    const [offset, setOffset] = useState(0);
    const [data, setData] = useState<ApiTransactions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setOffset(0);
    }, [range.startDate, range.endDate, category]);

    useEffect(() => {
        if (!isApiConfigured()) {
            const filtered = mockTransactions.filter((item) => {
                if (range.startDate && item.date < range.startDate) return false;
                if (range.endDate && item.date > range.endDate) return false;
                if (category && item.category?.toLowerCase() !== category.toLowerCase()) return false;
                return true;
            });
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
            "date"
        )
            .then((payload) => {
                if (!cancelled) setData(payload);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "";
                setData(null);
                setError(message === "API unreachable" ? message : "Could not load transactions.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId, range.startDate, range.endDate, category, offset]);

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
                                        <th>Date</th>
                                        <th>Merchant</th>
                                        <th>Category</th>
                                        <th>Amount</th>
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
