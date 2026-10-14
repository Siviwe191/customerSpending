import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBolt,
    faCar,
    faFilm,
    faShoppingBag,
    faShoppingCart,
    faUtensils,
    type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { isApiConfigured } from "../../../services/api";
import { categoryCatalog, mockCategories } from "../../../mockData";
import { fetchCategoryFilter } from "../services/dashboardApi";

const ICONS: Record<string, IconDefinition> = {
    "shopping-cart": faShoppingCart,
    film: faFilm,
    car: faCar,
    utensils: faUtensils,
    "shopping-bag": faShoppingBag,
    zap: faBolt,
};

export function categoryIcon(name?: string) {
    return name ? ICONS[name] : undefined;
}

type CategoryFilterProps = {
    customerId?: number;
    value: string;
    onChange: (category: string) => void;
};

export function CategoryFilter({ customerId = 1, value, onChange }: CategoryFilterProps) {
    const [categories, setCategories] = useState(categoryCatalog);

    useEffect(() => {
        if (!isApiConfigured()) {
            setCategories(categoryCatalog);
            return;
        }

        let cancelled = false;
        fetchCategoryFilter(customerId)
            .then((payload) => {
                if (!cancelled) setCategories(payload.categories?.length ? payload.categories : categoryCatalog);
            })
            .catch(() => {
                if (!cancelled) setCategories(mockCategories.categories ?? categoryCatalog);
            });

        return () => {
            cancelled = true;
        };
    }, [customerId]);

    const chips = (
        <div className="category-filters" role="group" aria-label="Category">
            <button
                type="button"
                className={`category-filter${value === "" ? " is-active" : ""}`}
                aria-pressed={value === ""}
                onClick={() => onChange("")}
            >
                All
            </button>
            {categories.map((category) => {
                const name = category.name || "";
                const selected = value.toLowerCase() === name.toLowerCase();
                const icon = categoryIcon(category.icon);
                return (
                    <button
                        key={name}
                        type="button"
                        className={`category-filter${selected ? " is-active" : ""}`}
                        aria-pressed={selected}
                        style={
                            selected
                                ? { background: category.color, borderColor: category.color, color: "#fff" }
                                : { color: category.color, borderColor: category.color }
                        }
                        onClick={() => onChange(name)}
                    >
                        {icon ? <FontAwesomeIcon icon={icon} /> : null}
                        {name}
                    </button>
                );
            })}
        </div>
    );

    return (
        <>
            {chips}
            <label className="category-filter-select">
                <span className="dash-select-label">Category</span>
                <select aria-label="Category" value={value} onChange={(event) => onChange(event.target.value)}>
                    <option value="">All</option>
                    {categories.map((category) => {
                        const name = category.name || "";
                        return (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        );
                    })}
                </select>
            </label>
        </>
    );
}
