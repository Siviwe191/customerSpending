import { useEffect, useState } from "react";
import { apiErrorMessage, isApiConfigured } from "../../../services/api";
import { mockTrends } from "../../../mockData";
import { fetchSpendingTrends, type ApiSpendingTrends } from "../services/dashboardApi";

const money = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
});

export function SpendingTrends({ customerId = 1 }: { customerId?: number }) {
    const [data, setData] = useState<ApiSpendingTrends | null>(() => (isApiConfigured() ? null : mockTrends));
    const [loading, setLoading] = useState(() => isApiConfigured());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isApiConfigured()) {
            setData(mockTrends);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchSpendingTrends(customerId)
            .then((payload) => {
                if (!cancelled) setData(payload);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setData(null);
                setError(apiErrorMessage(err, "Could not load monthly trends."));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId]);

    const trends = data?.trends ?? [];
    const peak = Math.max(...trends.map((item) => item.totalSpent), 0);

    return (
        <>
            <div className="section-header ops-dash-header">
                <div>
                    <h2 className="ops-dash-title">Monthly spending trends</h2>
                    <p className="ops-dash-subtitle">Spent, transaction count, and average by month.</p>
                </div>
            </div>

            {loading && <p className="settings-hint">Loading trends…</p>}
            {error && (
                <p className="add-users-alert add-users-alert--error" role="alert">
                    {error}
                </p>
            )}

            {data && (
                <section className="dash-panel">
                    {trends.length === 0 ? (
                        <p className="settings-hint">No monthly trends yet.</p>
                    ) : (
                        <ul className="trend-list">
                            {trends.map((item) => {
                                const width = peak > 0 ? Math.max(4, (item.totalSpent / peak) * 100) : 0;
                                return (
                                    <li key={item.month ?? item.totalSpent} className="trend-row">
                                        <span className="trend-month">{item.month || "—"}</span>
                                        <div className="trend-track" aria-hidden="true">
                                            <span className="trend-fill" style={{ width: `${width}%` }} />
                                        </div>
                                        <div className="trend-figures">
                                            <strong>{money.format(item.totalSpent)}</strong>
                                            <span>
                                                {item.transactionsCount.toLocaleString("en-ZA")} · avg{" "}
                                                {money.format(item.averageTransaction)}
                                            </span>
                                        </div>
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
