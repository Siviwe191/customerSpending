import { useState } from "react";

export type DateRange = {
    startDate: string;
    endDate: string;
};

type DatePreset = "today" | "7d" | "30d" | "90d" | "1yr";

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "7d", label: "7 days" },
    { id: "30d", label: "30 days" },
    { id: "90d", label: "90 days" },
    { id: "1yr", label: "1 year" },
];

function toDateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function shiftDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return toDateInput(date);
}

function shiftYears(years: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return toDateInput(date);
}

function presetRange(preset: DatePreset): DateRange {
    const today = toDateInput(new Date());
    if (preset === "today") return { startDate: today, endDate: today };
    if (preset === "7d") return { startDate: shiftDays(-6), endDate: today };
    if (preset === "30d") return { startDate: shiftDays(-29), endDate: today };
    if (preset === "90d") return { startDate: shiftDays(-89), endDate: today };
    return { startDate: shiftYears(-1), endDate: today };
}

export function presetForRange(range: DateRange): DatePreset | "custom" {
    return activePreset(range.startDate, range.endDate);
}

function activePreset(startDate: string, endDate: string): DatePreset | "custom" {
    for (const preset of DATE_PRESETS) {
        const range = presetRange(preset.id);
        if (range.startDate === startDate && range.endDate === endDate) return preset.id;
    }
    return "custom";
}

export function defaultDateRange(): DateRange {
    return presetRange("30d");
}

export function formatDayLabel(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { dateStyle: "medium" });
}

type DateRangeFilterProps = {
    value?: DateRange;
    onChange?: (range: DateRange) => void;
    presetsOnly?: boolean;
};

export function DateRangeFilter({ value, onChange, presetsOnly = false }: DateRangeFilterProps) {
    const [internal, setInternal] = useState(defaultDateRange);
    const range = value ?? internal;
    const selectedPreset = activePreset(range.startDate, range.endDate);

    const update = (next: DateRange) => {
        if (!value) setInternal(next);
        onChange?.(next);
    };

    return (
        <div className="ops-dash-toolbar">
            <div className="ops-date-filter">
                <div className="ops-date-presets" role="group" aria-label="Date range">
                    {DATE_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            className={`ops-date-preset${selectedPreset === preset.id ? " ops-date-preset--active" : ""}`}
                            aria-pressed={selectedPreset === preset.id}
                            onClick={() => update(presetRange(preset.id))}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
                {presetsOnly ? null : (
                    <>
                        <label className="ops-date-field">
                            <span>From</span>
                            <input
                                type="date"
                                value={range.startDate}
                                max={range.endDate || undefined}
                                onChange={(e) => update({ startDate: e.target.value, endDate: range.endDate })}
                            />
                        </label>
                        <label className="ops-date-field">
                            <span>To</span>
                            <input
                                type="date"
                                value={range.endDate}
                                min={range.startDate || undefined}
                                onChange={(e) => update({ startDate: range.startDate, endDate: e.target.value })}
                            />
                        </label>
                    </>
                )}
            </div>
        </div>
    );
}
