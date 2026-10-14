import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { setApiToken } from "../services/api";

type AuthContextValue = {
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    clearAccessToken: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessTokenState] = useState<string | null>(null);

    const value = useMemo<AuthContextValue>(() => {
        const setAccessToken = (token: string | null) => {
            setApiToken(token);
            setAccessTokenState(token);
        };

        return {
            accessToken,
            setAccessToken,
            clearAccessToken: () => setAccessToken(null),
        };
    }, [accessToken]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used within AuthProvider");
    return value;
}
