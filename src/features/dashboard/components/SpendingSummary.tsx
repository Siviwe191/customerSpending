import { useEffect, useState } from "react";
import { ChangeHint } from "../../../components/ChangeHint";
import { DateRangeFilter, defaultDateRange, formatDayLabel, presetForRange } from "../../../components/DateRangeFilter";
import { fetchSpendingSummary, isApiConfigured, type ApiSpendingSummary } from "../../../services/api";
import { mockSummaryForRange } from "../../../mockData";
import { SummaryCard } from "./SummaryCard";
import type { SpendingSummaryData } from "../types/types.ts";

type SummaryTab = "monthly-trends" | "transactions" | "spending-by-category";

const money = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
});

function toSummary(payload: ApiSpendingSummary): SpendingSummaryData | null {
    const summary = payload.sp_summary;
    if (!summary) return null;
    return {
        totalSpent: Number(summary.totalSpent) || 0,
        transactionsCount: Number(summary.transactionsCount) || 0,
        averageTransaction: Number(summary.averageTransaction) || 0,
        topCategory: summary.topCategory || "—",
        comparedToPrevious: {
            spentChange: Number(summary.comparedToPrevious?.spentChange) || 0,
            transactionChange: Number(summary.comparedToPrevious?.transactionChange) || 0,
        },
    };
}

export function SpendingSummary({
    customerId = 1,
    onOpenTab,
}: {
    customerId?: number;
    onOpenTab?: (tab: SummaryTab) => void;
}) {
    const [range, setRange] = useState(defaultDateRange);
    const [data, setData] = useState<SpendingSummaryData | null>(() =>
        isApiConfigured() ? null : mockSummaryForRange(defaultDateRange())
    );
    const [loading, setLoading] = useState(() => isApiConfigured());
    const [error, setError] = useState<string | null>(null);
    const rangeActive = Boolean(range.startDate || range.endDate);

    useEffect(() => {
        if (!isApiConfigured()) {
            setData(mockSummaryForRange(range));
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const preset = presetForRange(range);
        fetchSpendingSummary(customerId, {
            startDate: range.startDate,
            endDate: range.endDate,
            period: preset === "custom" ? undefined : preset,
        })
            .then((payload) => {
                if (cancelled) return;
                const summary = toSummary(payload);
                if (!summary) {
                    setData(null);
                    setError("Could not load spending summary.");
                    return;
                }
                setData(summary);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "";
                setData(null);
                setError(message === "API unreachable" ? message : "Could not load spending summary.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId, range.startDate, range.endDate]);

    const spentChange = data?.comparedToPrevious.spentChange ?? 0;
    const transactionChange = data?.comparedToPrevious.transactionChange ?? 0;

    return (
        <>
            <div className="section-header ops-dash-header">
                <div>
                    <h2 className="ops-dash-title">Spending summary</h2>
                    <p className="ops-dash-subtitle">
                        {rangeActive
                            ? `Totals from ${range.startDate ? formatDayLabel(range.startDate) : "the start"} to ${range.endDate ? formatDayLabel(range.endDate) : "today"}.`
                            : "Overview of all your spending habits."}
                    </p>
                </div>
                <DateRangeFilter value={range} onChange={setRange} presetsOnly />
            </div>

            {loading && <p className="settings-hint">Loading spending summary…</p>}
            {error && (
                <p className="add-users-alert add-users-alert--error" role="alert">
                    {error}
                </p>
            )}

            {data && (
                <div className="dash-kpi-row">
                    <SummaryCard
                        label="Total spent"
                        value={money.format(data.totalSpent)}
                        hint={<ChangeHint value={spentChange} />}
                        tone="live"
                        onClick={() => onOpenTab?.("monthly-trends")}
                    />
                    <SummaryCard
                        label="Transactions"
                        value={data.transactionsCount.toLocaleString("en-ZA")}
                        hint={<ChangeHint value={transactionChange} />}
                        onClick={() => onOpenTab?.("transactions")}
                    />
                    <SummaryCard
                        label="Average transaction"
                        value={money.format(data.averageTransaction)}
                        hint={`${data.transactionsCount.toLocaleString("en-ZA")} transactions`}
                        onClick={() => onOpenTab?.("transactions")}
                    />
                    <SummaryCard
                        label="Top category"
                        value={data.topCategory}
                        hint="Highest spend"
                        onClick={() => onOpenTab?.("spending-by-category")}
                    />
                </div>
            )}
        </>
    );
}
