import { useEffect, useState } from "react";
import { apiErrorMessage, isApiConfigured } from "../../../services/api";
import { mockGoals } from "../../../mockData";
import { fetchSpendingGoals, type ApiSpendingGoals } from "../services/dashboardApi";

const money = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
});

function asMoney(value: string | number | undefined) {
    const amount = Number(value);
    return Number.isFinite(amount) ? money.format(amount) : value || "—";
}

function goalState(status: string | undefined, used: number): "over" | "warning" | "ok" {
    if (/warn/i.test(status || "")) return "warning";
    if (/over/i.test(status || "")) return "over";
    if (/track/i.test(status || "")) return "ok";
    if (used > 100) return "over";
    return "ok";
}

function goalLabel(status: string | undefined, state: "over" | "warning" | "ok") {
    if (state === "over") return /over/i.test(status || "") ? status : "Over budget";
    if (state === "warning") return /warn/i.test(status || "") ? status : "Warning";
    return status || "On track";
}

export function SpendingGoals({ customerId = 1 }: { customerId?: number }) {
    const [data, setData] = useState<ApiSpendingGoals | null>(() => (isApiConfigured() ? null : mockGoals));
    const [loading, setLoading] = useState(() => isApiConfigured());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isApiConfigured()) {
            setData(mockGoals);
            setLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchSpendingGoals(customerId)
            .then((payload) => {
                if (!cancelled) setData(payload);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setData(null);
                setError(apiErrorMessage(err, "Could not load spending goals."));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId]);

    const goals = data?.goals ?? [];
    const statusCounts = { ok: 0, warning: 0, over: 0 };
    for (const goal of goals) {
        const used = Math.max(0, Number(goal.percentageUsed) || 0);
        statusCounts[goalState(goal.status, used)] += 1;
    }
    const statuses = [
        { id: "ok" as const, label: "On track", className: "pill--active" },
        { id: "warning" as const, label: "Warning", className: "pill--warning" },
        { id: "over" as const, label: "Over budget", className: "pill--over" },
    ];

    return (
        <>
            <div className="section-header ops-dash-header">
                <div>
                    <h2 className="ops-dash-title">Spending goals</h2>
                    <p className="ops-dash-subtitle">Monthly budgets and how much of each is already used.</p>
                </div>
            </div>

            {loading && <p className="settings-hint">Loading goals…</p>}
            {error && (
                <p className="add-users-alert add-users-alert--error" role="alert">
                    {error}
                </p>
            )}

            {data && (
                goals.length === 0 ? (
                    <p className="settings-hint">No spending goals yet.</p>
                ) : (
                    <>
                    <ul className="goal-status-list">
                        {statuses.map((status) => (
                            <li key={status.id}>
                                <span className={`pill ${status.className}`}>{status.label}</span>
                                <strong>{statusCounts[status.id]}</strong>
                            </li>
                        ))}
                    </ul>
                    <div className="goal-grid">
                        {goals.map((goal) => {
                            const used = Math.max(0, Number(goal.percentageUsed) || 0);
                            const state = goalState(goal.status, used);
                            return (
                                <article key={goal.id ?? goal.category} className="goal-card">
                                    <div className="goal-card-head">
                                        <h3>{goal.category || "Goal"}</h3>
                                        <span className={`pill ${state === "over" ? "pill--over" : state === "warning" ? "pill--warning" : "pill--active"}`}>
                                            {goalLabel(goal.status, state)}
                                        </span>
                                    </div>
                                    <p className="goal-amounts">
                                        <strong>{asMoney(goal.currentSpent)}</strong>
                                        <span>of {money.format(goal.monthlyBudget)}</span>
                                    </p>
                                    <div className="category-track" aria-hidden="true">
                                        <span
                                            className={`category-fill ${state === "over" ? "category-fill--over" : state === "warning" ? "category-fill--warning" : ""}`}
                                            style={{ width: `${Math.min(used, 100)}%` }}
                                        />
                                    </div>
                                    <p className="category-meta">
                                        {used.toFixed(0)}% used
                                        {goal.daysRemaining ? ` · ${goal.daysRemaining} days left` : ""}
                                    </p>
                                </article>
                            );
                        })}
                    </div>
                    </>
                )
            )}
        </>
    );
}
