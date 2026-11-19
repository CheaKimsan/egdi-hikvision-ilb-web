import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import {
    clearSession,
    getUserProfile,
    isAccountActive,
    persistSession,
    restoreSession,
    signIn,
    signOutUser,
    subscribeToAuth,
    type AuthUser,
    type FireUser,
} from "./core/auth.service";

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();

    // Restore the saved session synchronously so a refresh doesn't flash /login.
    const [restoredUser] = useState<AuthUser | null>(restoreSession);
    const [user, setUser] = useState<AuthUser | null>(restoredUser);
    const [isLoading, setIsLoading] = useState(restoredUser === null);

    const justLoggedInRef = useRef(false);
    const inFlightProfileRef = useRef<Promise<AuthUser> | null>(null);

    const loadProfile = useCallback(
        (firebaseUser: FireUser, isNewLogin: boolean): Promise<AuthUser> => {
            if (!inFlightProfileRef.current) {
                inFlightProfileRef.current = getUserProfile(
                    firebaseUser,
                    isNewLogin
                ).finally(() => {
                    inFlightProfileRef.current = null;
                });
            }
            return inFlightProfileRef.current;
        },
        []
    );

    // Reset everything when there is no valid session.
    const resetSession = useCallback(() => {
        setUser(null);
        clearSession();
        queryClient.clear();
    }, [queryClient]);

    // Handle Firebase authentication state.
    useEffect(() => {
        const unsubscribe = subscribeToAuth(async (firebaseUser) => {
            if (!firebaseUser) {
                resetSession();
                setIsLoading(false);
                return;
            }

            const isNewLogin = justLoggedInRef.current;
            justLoggedInRef.current = false;

            try {
                const profile = await loadProfile(firebaseUser, isNewLogin);

                if (!isAccountActive(profile)) {
                    await signOutUser();
                    resetSession();
                    return;
                }

                setUser(profile);
                persistSession(profile);
            } catch (error) {
                console.error("Failed to load user profile:", error);
                resetSession();
                await signOutUser();
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [loadProfile, resetSession]);

    // isLoading is NOT toggled here: Formik's isSubmitting handles the button.
    const login = useCallback(
        async (email: string, password: string): Promise<boolean> => {
            try {
                justLoggedInRef.current = true;

                const cred = await signIn(email, password);
                const profile = await loadProfile(cred.user, true);

                if (!isAccountActive(profile)) {
                    justLoggedInRef.current = false;
                    await signOutUser();
                    resetSession();
                    return false;
                }

                setUser(profile);
                persistSession(profile);
                return true;
            } catch (error) {
                justLoggedInRef.current = false;
                console.error(
                    "Login failed:",
                    (error as { code?: string }).code,
                    error
                );
                return false;
            }
        },
        [loadProfile, resetSession]
    );

    const logout = useCallback(async (): Promise<void> => {
        try {
            await signOutUser();
            resetSession();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }, [resetSession]);

    const value = useMemo(
        () => ({ user, isLoading, login, logout }),
        [user, isLoading, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
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