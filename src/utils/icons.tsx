export function ThinChevron({ direction }: { direction: "left" | "right" }) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
                d={direction === "left" ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"}
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function ProfileOutlineIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="3.25" />
            <path d="M5.5 19.25c.85-3.15 3.4-4.75 6.5-4.75s5.65 1.6 6.5 4.75" />
        </svg>
    );
}

export function QrOutlineIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="5.2" y="5.2" width="2.6" height="2.6" rx="0.4" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="16.2" y="5.2" width="2.6" height="2.6" rx="0.4" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="5.2" y="16.2" width="2.6" height="2.6" rx="0.4" />
            <path d="M14 14h.01M17.5 14h.01M21 14h.01M14 17.5h.01M17.5 17.5h.01M21 17.5h.01M14 21h.01M17.5 21h.01M21 21h.01" />
        </svg>
    );
}
