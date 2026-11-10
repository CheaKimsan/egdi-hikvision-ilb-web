import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { dummyUsers } from "../../../lib/data/dummy";
import { DummyUser } from "./core/model";

export type AuthUser = Omit<DummyUser, "password">;

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const STORAGE_KEY = "egdi_ilb_auth_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): AuthUser | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(readStoredUser);

    const login = useCallback((username: string, password: string): boolean => {
        const matchedUser = dummyUsers.find(
            (candidate) =>
                candidate.username.toLowerCase() === username.trim().toLowerCase() &&
                candidate.password === password
        );

        if (!matchedUser) return false;

        const { password: _password, ...authenticatedUser } = matchedUser;
        setUser(authenticatedUser);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
        } catch {
            // Storage full or blocked: user stays logged in for this session only
        }

        return true;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY) {
                setUser(readStoredUser());
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const value = useMemo(
        () => ({ user, isLoading: false, login, logout }),
        [user, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};