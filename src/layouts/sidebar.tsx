import {useMemo, useState, type ReactNode} from "react";
import { Nav, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useCustomerProfile } from "../hooks/useCustomerProfile";
import Logo from "./Logo";
import { QrOutlineIcon, ThinChevron, ProfileOutlineIcon } from "../utils/icons";

interface SidebarProps {
    activeItem: string;
    setActiveItem: (id: string) => void;
}

type NavItem = {
    id: string;
    name: string;
    customIcon?: ReactNode;
};


function Sidebar({ activeItem, setActiveItem, customerId = 1 }: SidebarProps & { customerId?: number }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { profile } = useCustomerProfile(customerId);
    const displayName = profile?.name || "";
    const displayEmail = profile?.email || "";
    const initials = (displayName || "U").charAt(0).toUpperCase();

    const sections = useMemo(()=>{
       const all = [
           {
               title: "Overview",
               items: [
                   { id: "dashboard", name: "Dashboard", customIcon: <QrOutlineIcon /> },
               ],
           },
           {
               title: "Account",
               items: [
                   { id: "profile", name: "My Profile", customIcon: <ProfileOutlineIcon /> },
               ],
           },
       ]

        return all
            .map((section) => ({
                ...section,
            }));
    },[]);


    return (
        <div
            className={`sidebar d-flex flex-column text-white${isCollapsed ? " sidebar--collapsed" : ""}`}
            style={{ width: isCollapsed ? "76px" : "240px" }}
        >
            <div
                className={`sidebar-header d-flex ${
                    isCollapsed
                        ? "flex-column align-items-center gap-2 px-2 py-3"
                        : "align-items-center justify-content-between"
                }`}
            >
                <div className="sidebar-logo-wrap">
                    <Logo collapsed={isCollapsed} />
                </div>
                {!isCollapsed ? (
                    <Button
                        variant="link"
                        className="sidebar-collapse-btn p-0"
                        onClick={() => setIsCollapsed(true)}
                        aria-label="Collapse sidebar"
                        style={{ textDecoration: "none", color: "#94a3b8" }}
                    >
                        <ThinChevron direction="left" />
                    </Button>
                ) : (
                    <Button
                        variant="link"
                        className="p-0 mt-2"
                        onClick={() => setIsCollapsed(false)}
                        aria-label="Expand sidebar"
                        style={{ textDecoration: "none", color: "#94a3b8" }}
                    >
                        <ThinChevron direction="right" />
                    </Button>
                )}
            </div>
            <div className="flex-grow-1 sidebar-nav-wrap">
                <Nav className="flex-column px-1 pb-2">
                    {sections.map((section) => (
                        <div key={section.title} className="mb-2">
                            {!isCollapsed && (
                                <div
                                    className="px-2 mt-2 mb-1 text-uppercase"
                                    style={{
                                        fontSize: "10px",
                                        color: "#fff",
                                        letterSpacing: "0.08em",
                                        fontWeight: 600,
                                    }}
                                >
                                    {section.title}
                                </div>
                            )}
                            {section.items.map((item: NavItem) => {
                                const isActive = activeItem === item.id;
                                const link = (
                                    <Nav.Link
                                        onClick={() => setActiveItem(item.id)}
                                        className={`sidebar-nav-link${isCollapsed ? " sidebar-nav-link--collapsed" : ""}${
                                            isActive ? " active" : ""
                                        }`}
                                        aria-label={item.name}
                                    >
                                        <span className="nav-icon">
                                            {item.customIcon ? (
                                                item.customIcon
                                            ) :  null}
                                        </span>
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </Nav.Link>
                                );

                                if (!isCollapsed) {
                                    return <div key={item.id}>{link}</div>;
                                }

                                return (
                                    <OverlayTrigger
                                        key={item.id}
                                        placement="right"
                                        delay={{ show: 120, hide: 0 }}
                                        overlay={
                                            <Tooltip
                                                id={`sidebar-tip-${item.id}`}
                                                className="sidebar-tooltip"
                                            >
                                                {item.name}
                                            </Tooltip>
                                        }
                                    >
                                        {link}
                                    </OverlayTrigger>
                                );
                            })}
                        </div>
                    ))}
                </Nav>
            </div>
            <div className="sidebar-footer">
                {isCollapsed ? (
                    <OverlayTrigger
                        placement="right"
                        delay={{ show: 120, hide: 0 }}
                        overlay={
                            <Tooltip id="sidebar-tip-user" className="sidebar-tooltip">
                                {displayName} · {displayEmail}
                            </Tooltip>
                        }
                    >
                        <div
                            className="d-flex align-items-center justify-content-center"
                            aria-label={displayName}
                        >
                            <div className="sidebar-avatar">{initials}</div>
                        </div>
                    </OverlayTrigger>
                ) : (
                    <div className="d-flex align-items-center gap-2">
                        <div className="sidebar-avatar">{initials}</div>
                        <div className="text-truncate flex-grow-1">
                            <div
                                style={{
                                    fontSize: "12.5px",
                                    fontWeight: 600,
                                    color: "#f8fafc",
                                    lineHeight: 1.2,
                                }}
                            >
                                {displayName}
                            </div>
                            <div style={{ fontSize: "10px", color: "lightgrey" }}>
                                {displayEmail}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
