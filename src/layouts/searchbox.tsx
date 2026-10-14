import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdBadge, faMagnifyingGlass, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { globalSearch, kindLabel, type SearchAccount, type SearchResult, type SearchResultKind } from "../utils/globalSearch";

interface SearchBoxProps {
    account?: SearchAccount | null;
    onNavigate?: (id: string) => void;
}

const KIND_ICON: Record<SearchResultKind, typeof faFolderOpen> = {
    page: faFolderOpen,
    account: faIdBadge,
};

export function SearchBox({ account, onNavigate }: SearchBoxProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
    const wrapRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listId = useId();

    const results = globalSearch(query, account);
    const showResults = open && query.trim().length > 0;

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useLayoutEffect(() => {
        if (!showResults) return;

        const place = () => {
            const rect = wrapRef.current?.getBoundingClientRect();
            if (!rect) return;
            const width = Math.min(440, window.innerWidth - 24);
            const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
            setPanelStyle({
                top: rect.bottom + 8,
                left,
                width,
            });
        };

        place();
        window.addEventListener("resize", place);
        window.addEventListener("scroll", place, true);
        return () => {
            window.removeEventListener("resize", place);
            window.removeEventListener("scroll", place, true);
        };
    }, [showResults, query, results.length]);

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (wrapRef.current?.contains(target) || listRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    const selectResult = (result: SearchResult) => {
        onNavigate?.(result.navigateTo);
        setQuery("");
        setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Escape") {
            event.stopPropagation();
            setOpen(false);
            return;
        }

        if (!showResults || results.length === 0) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % results.length);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + results.length) % results.length);
        } else if (event.key === "Enter") {
            event.preventDefault();
            selectResult(results[activeIndex]);
        }
    };

    return (
        <div className="search-box-wrap" ref={wrapRef}>
            <div className="search-box-field">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
                <input
                    type="search"
                    value={query}
                    placeholder="Search profiles, pages..."
                    className="search-box"
                    autoComplete="off"
                    aria-label="Search"
                    aria-autocomplete="list"
                    aria-controls={showResults ? listId : undefined}
                    aria-expanded={showResults}
                    role="combobox"
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                />
            </div>

            {showResults &&
                createPortal(
                    <div className="search-results" id={listId} ref={listRef} role="listbox" style={panelStyle}>
                        <div className="search-results-head">
                            <span>{results.length === 0 ? "No matches" : "Jump to"}</span>
                            <span>{results.length}</span>
                        </div>
                        {results.length === 0 ? (
                            <div className="search-results-empty">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                                <p>No matches for “{query.trim()}”</p>
                            </div>
                        ) : (
                            <div className="search-results-list">
                                {results.map((result, index) => (
                                    <button
                                        key={result.id}
                                        type="button"
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        className={`search-result-item${index === activeIndex ? " is-active" : ""}`}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => selectResult(result)}
                                    >
                                        <span className={`search-result-icon search-result-icon--${result.kind}`}>
                                            <FontAwesomeIcon icon={KIND_ICON[result.kind]} />
                                        </span>
                                        <span className="search-result-copy">
                                            <span className="search-result-title">{result.title}</span>
                                            <span className="search-result-subtitle">{result.subtitle}</span>
                                        </span>
                                        <span className={`search-result-kind search-result-kind--${result.kind}`}>
                                            {kindLabel(result.kind)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
}
