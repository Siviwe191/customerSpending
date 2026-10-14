type ChangeHintProps = {
    value: number;
};

export function ChangeHint({ value }: ChangeHintProps) {
    const direction = value > 0 ? "up" : value < 0 ? "down" : null;
    const sign = value > 0 ? "+" : "";

    return (
        <span className="kpi-change">
            {direction ? (
                <svg
                    className={`kpi-change-arrow kpi-change-arrow--${direction}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                >
                    {direction === "up" ? (
                        <path
                            d="M6 10V2M6 2 2.75 5.25M6 2l3.25 3.25"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ) : (
                        <path
                            d="M6 2v8M6 10 2.75 6.75M6 10l3.25-3.25"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                </svg>
            ) : null}
            {`${sign}${value.toFixed(1)}% vs previous`}
        </span>
    );
}
