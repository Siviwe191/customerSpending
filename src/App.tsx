import { useState } from "react";
import Dashboard, { type TabId } from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Sidebar from "./layouts/sidebar";
import Header from "./layouts/header";

const DASHBOARD_TABS = new Set<TabId>([
  "spending-summary",
  "spending-by-category",
  "monthly-trends",
  "transactions",
  "spending-goals",
]);

function App() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [dashboardTab, setDashboardTab] = useState<TabId>("spending-summary");

  const openDestination = (id: string) => {
    if (id === "profile") {
      setActiveItem("profile");
      return;
    }
    setActiveItem("dashboard");
    if (DASHBOARD_TABS.has(id as TabId)) setDashboardTab(id as TabId);
    else setDashboardTab("spending-summary");
  };

  return (
    <div className="app-shell">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="main-content">
        <Header
          title={activeItem === "profile" ? "My Profile" : "Dashboard"}
          onOpenProfile={() => setActiveItem("profile")}
          onNavigate={openDestination}
        />
        <div className="content-area">
          {activeItem === "profile" ? <Profile /> : <Dashboard activeTab={dashboardTab} onTabChange={setDashboardTab} />}
        </div>
      </div>
    </div>
  );
}

export default App;
