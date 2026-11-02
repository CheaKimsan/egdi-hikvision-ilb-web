import { createContext, useContext, useState, type ReactNode } from "react";
import { dummyUsers, type DummyUser } from "../../../_egdi_ilb/data/dummy";

export type AuthUser = Omit<DummyUser, "password">;

interface AuthContextValue {
    user: AuthUser | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    const login = (username: string, password: string): boolean => {
        const matchedUser = dummyUsers.find(
            (candidate) =>
                candidate.username.toLowerCase() === username.trim().toLowerCase() &&
                candidate.password === password
        );

        if (!matchedUser) {
            return false;
        }

        const { password: _password, ...authenticatedUser } = matchedUser;
        setUser(authenticatedUser);
        return true;
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
