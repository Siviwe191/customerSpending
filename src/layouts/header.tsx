import { useEffect, useRef, useState } from "react";
import { useCustomerProfile } from "../hooks/useCustomerProfile";
import { SearchBox } from "./searchbox";
import { ProfileOutlineIcon } from "../utils/icons";

interface HeaderProps {
    title: string;
    onOpenProfile: () => void;
    onNavigate: (id: string) => void;
}

function Header({ title, onOpenProfile, onNavigate }: HeaderProps) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const { profile } = useCustomerProfile();

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!panelRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const openProfile = () => {
        setOpen(false);
        onOpenProfile();
    };

    return (
        <header className="top-navbar">
            <h1 className="page-title">{title}</h1>

            <div className="mx-auto d-none d-md-flex justify-content-center flex-grow-1 px-3">
                <SearchBox
                    account={
                        profile
                            ? { name: profile.name, email: profile.email, accountType: profile.accountType }
                            : null
                    }
                    onNavigate={onNavigate}
                />
            </div>

            <div className="header-alerts" ref={panelRef}>
                <button
                    type="button"
                    className="header-alerts-btn"
                    aria-label="Account"
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={() => setOpen((value) => !value)}
                >
                    <ProfileOutlineIcon />
                </button>

                {open && (
                    <div className="header-alerts-panel" role="menu">
                        <div className="header-alerts-panel-head">
                            <strong>Account</strong>
                        </div>
                        <button type="button" className="header-alerts-item" role="menuitem" onClick={openProfile}>
                            <span className="header-alerts-item-main">
                                <strong>View profile</strong>
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
