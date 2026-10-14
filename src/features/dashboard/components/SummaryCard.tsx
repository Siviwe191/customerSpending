import type { ReactNode } from "react";

type SummaryCardProps = {
    label: string;
    value: string;
    hint?: ReactNode;
    tone?: "default" | "live" | "watch" | "muted";
    onClick?: () => void;
};

export function SummaryCard({ label, value, hint, tone = "default", onClick }: SummaryCardProps) {
    const Tag = onClick ? "button" : "div";

    return (
        <Tag
            type={onClick ? "button" : undefined}
            className={`dash-kpi dash-kpi--${tone}${onClick ? " dash-kpi--clickable" : ""}`}
            onClick={onClick}
        >
            <span className="dash-kpi-value">{value}</span>
            <span className="dash-kpi-label">{label}</span>
            {hint ? <span className="dash-kpi-hint">{hint}</span> : null}
        </Tag>
    );
}
