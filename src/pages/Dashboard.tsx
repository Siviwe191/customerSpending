import { useState } from "react";
import { SpendingByCategory } from "../features/dashboard/components/SpendingByCategory";
import { SpendingGoals } from "../features/dashboard/components/SpendingGoals";
import { SpendingSummary } from "../features/dashboard/components/SpendingSummary";
import { SpendingTrends } from "../features/dashboard/components/SpendingTrends";
import { TransactionsList } from "../features/dashboard/components/TransactionsList";


const TABS = [
    { id: "spending-summary", label: "Spending summary" },
    { id: "spending-by-category", label: "Spending by category" },
    { id: "monthly-trends", label: "Monthly spending trends" },
    { id: "transactions", label: "Transactions" },
    { id: "spending-goals", label: "Spending Goals" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

type DashboardProps = {
    activeTab?: TabId;
    onTabChange?: (tab: TabId) => void;
};

const Dashboard = ({ activeTab: controlledTab, onTabChange }: DashboardProps) => {
    const [internalTab, setInternalTab] = useState<TabId>("spending-summary");
    const activeTab = controlledTab ?? internalTab;
    const setActiveTab = (tab: TabId) => {
        if (onTabChange) onTabChange(tab);
        else setInternalTab(tab);
    };
    const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

    return (
        <div className="dashboard ops-dashboard">
            <div className="dash-tabs" role="tablist" aria-label="Dashboard">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`dash-tab-${tab.id}`}
                            aria-selected={isActive}
                            aria-controls={`dash-panel-${tab.id}`}
                            className={`dash-tab${isActive ? " is-active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            <label className="dash-tab-select">
                <span className="dash-select-label">Section</span>
                <select
                    aria-label="Dashboard section"
                    value={activeTab}
                    onChange={(event) => setActiveTab(event.target.value as TabId)}
                >
                    {TABS.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                            {tab.label}
                        </option>
                    ))}
                </select>
            </label>

            <div
                className="dash-tab-panel"
                role="tabpanel"
                id={`dash-panel-${active.id}`}
                aria-labelledby={`dash-tab-${active.id}`}
            >
                {active.id === "spending-summary" && <SpendingSummary onOpenTab={setActiveTab} />}
                {active.id === "spending-by-category" && <SpendingByCategory />}
                {active.id === "monthly-trends" && <SpendingTrends />}
                {active.id === "transactions" && <TransactionsList />}
                {active.id === "spending-goals" && <SpendingGoals />}
            </div>
        </div>
    );
};

export default Dashboard;
