import { useCustomerProfile } from "../hooks/useCustomerProfile";

function formatJoinDate(iso: string) {
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return iso || "—";
    return new Date(year, month - 1, day).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatMoney(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(amount);
    } catch {
        return new Intl.NumberFormat("en-ZA", {
            style: "currency",
            currency: "ZAR",
            minimumFractionDigits: 2,
        }).format(amount);
    }
}

const Profile = ({ customerId = 1 }: { customerId?: number }) => {
    const { profile, loading, error } = useCustomerProfile(customerId);

    const fields = profile
        ? [
            { label: "Full name", value: profile.name },
            { label: "Email", value: profile.email || "—" },
            { label: "Join date", value: formatJoinDate(profile.joinDate) },
            { label: "Account type", value: profile.accountType || "—" },
            { label: "Total spent", value: formatMoney(profile.totalSpent, profile.currency) },
            { label: "Currency", value: profile.currency },
        ]
        : [];

    return (
        <div className="account-profile">
            <div className="section-header">
                <h5>My Profile</h5>
                <p>Account details</p>
            </div>

            {loading && <p className="settings-hint">Loading profile…</p>}
            {error && (
                <p className="add-users-alert add-users-alert--error" role="alert">
                    {error}
                </p>
            )}

            {profile && (
                <div className="account-profile-layout">
                    <aside className="account-profile-aside">
                        <div className="account-avatar" aria-hidden="true">
                            {(profile.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="account-profile-name">{profile.name}</div>
                        <div className="account-profile-email">{profile.email}</div>
                        {profile.accountType ? <span className="pill pill--active">{profile.accountType}</span> : null}
                    </aside>

                    <div className="account-profile-main">
                        <div className="profile-detail-panel">
                            <div className="profile-detail-panel-header">
                                <div className="profile-detail-panel-title"><u>Account information</u></div>
                            </div>
                            <dl className="profile-detail-grid">
                                {fields.map((field) => (
                                    <div key={field.label} className="profile-detail-field">
                                        <dt>{field.label}</dt>
                                        <dd>{field.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
