import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
    type User,
} from "firebase/auth";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
    type DocumentReference,
} from "firebase/firestore";

import { auth, db } from "../../../../config/firebase.config";
import { STATUS_ACTIVE } from "../../../../lib/constants/Status";
import { IUser, SessionInfo } from "../../account/users/core/model";

type AuthUser = Omit<IUser, "password">;

type FireUser = User;

const DEFAULT_ROLE = "viewer";
const AUTH_STORAGE_KEY = "authUser";
let registering = false;

const restoreSession = (): AuthUser | null => {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        clearSession();
        return null;
    }
};

const persistSession = (user: AuthUser): void => {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
        console.warn("Could not persist session:", error);
    }
};

const clearSession = (): void => {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // Ignore storage errors.
    }
};



// Each IP lookup request gives up after this long. Providers are tried in order below.
const LOOKUP_TIMEOUT_MS = 4000;
const UNKNOWN = "Unknown";

const parseBrowser = (ua: string): { browser: string; browser_version: string } => {
    // Order matters: Edge/Opera/Samsung also contain "Chrome", and Chrome also contains "Safari"
    const rules: Array<[string, RegExp]> = [
        ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
        ["Opera", /(?:OPR|Opera)\/([\d.]+)/],
        ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
        ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
        ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
        ["Safari", /Version\/([\d.]+).*Safari/],
    ];

    for (const [browser, pattern] of rules) {
        const match = ua.match(pattern);
        if (match) return { browser, browser_version: match[1] };
    }
    return { browser: UNKNOWN, browser_version: UNKNOWN };
};

type NavigatorWithUaData = Navigator & {
    userAgentData?: {
        getHighEntropyValues?: (hints: string[]) => Promise<{ platformVersion?: string }>;
    };
};

const parseOs = async (ua: string): Promise<{ os: string; os_version: string }> => {
    const windows = ua.match(/Windows NT ([\d.]+)/);
    if (windows) {
        const names: Record<string, string> = { "10.0": "10", "6.3": "8.1", "6.2": "8", "6.1": "7" };
        let version = names[windows[1]] ?? windows[1];

        // Windows 11 still says "NT 10.0" in the user agent. Chromium can tell them apart.
        if (version === "10") {
            try {
                const high = await (navigator as NavigatorWithUaData).userAgentData
                    ?.getHighEntropyValues?.(["platformVersion"]);
                if (high?.platformVersion && parseInt(high.platformVersion, 10) >= 13) {
                    version = "11";
                }
            } catch {
                // Keep "10"
            }
        }
        return { os: "Windows", os_version: `windows-${version}` };
    }

    // iOS must be checked before macOS ("like Mac OS X") and Android before Linux
    const ios = ua.match(/CPU (?:iPhone )?OS (\d+)[_.](\d+)/);
    if (ios) return { os: "iOS", os_version: `ios-${ios[1]}.${ios[2]}` };

    const android = ua.match(/Android ([\d.]+)/);
    if (android) return { os: "Android", os_version: `android-${android[1]}` };

    const mac = ua.match(/Mac OS X ([\d_.]+)/);
    if (mac) return { os: "macOS", os_version: `macos-${mac[1].replace(/_/g, ".")}` };

    if (/CrOS/.test(ua)) return { os: "ChromeOS", os_version: "chromeos" };
    if (/Linux/.test(ua)) return { os: "Linux", os_version: "linux" };

    return { os: UNKNOWN, os_version: UNKNOWN };
};

const parseDeviceType = (ua: string): SessionInfo["deviceType"] => {
    // iPadOS Safari pretends to be a Mac, so check touch support too
    const isIpad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (isIpad || /Tablet/i.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) {
        return "tablet";
    }
    if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
    return "desktop";
};

const parseDevice = (ua: string): string => {
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";

    // Android UA contains the model, e.g. "Linux; Android 14; SM-S918B Build/..."
    const android = ua.match(/Android[^;]*;\s*([^;)]+?)(?:\sBuild|\))/);
    if (android && android[1] !== "K") return android[1].trim();

    // Desktop browsers don't reveal a device model
    return UNKNOWN;
};

const getOrientation = (): SessionInfo["orientation"] =>
    window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";

type NetworkInfo = Pick<
    SessionInfo,
    "ipAddress" | "city" | "region" | "country" | "isVpn" | "isp"
>;

const fetchJson = async (url: string) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`${url} returned ${response.status}`);
        return await response.json();
    } finally {
        window.clearTimeout(timer);
    }
};

// Free IP lookup providers, tried in order. Only the first one reports VPN/proxy.
// To add or swap one, return whichever fields it provides.
const IP_PROVIDERS: Array<{ name: string; lookup: () => Promise<Partial<NetworkInfo>> }> = [
    {
        name: "ipapi.is",
        lookup: async () => {
            const d = await fetchJson("https://api.ipapi.is");
            return {
                ipAddress: d.ip,
                city: d.location?.city,
                region: d.location?.state,
                country: d.location?.country_code,
                // Count VPN, proxy and Tor as "isVpn"
                isVpn: Boolean(d.is_vpn || d.is_proxy || d.is_tor),
                isp: d.company?.name || d.asn?.org,
            };
        },
    },
    {
        name: "ipwho.is",
        lookup: async () => {
            const d = await fetchJson("https://ipwho.is/");
            if (d.success === false) throw new Error(d.message || "lookup failed");
            return {
                ipAddress: d.ip,
                city: d.city,
                region: d.region,
                country: d.country_code,
                isp: d.connection?.isp || d.connection?.org,
            };
        },
    },
    {
        name: "ipapi.co",
        lookup: async () => {
            const d = await fetchJson("https://ipapi.co/json/");
            if (d.error) throw new Error(d.reason || "lookup failed");
            return {
                ipAddress: d.ip,
                city: d.city,
                region: d.region,
                country: d.country_code,
                isp: d.org,
            };
        },
    },
];

const lookupNetwork = async (): Promise<NetworkInfo> => {
    const result: NetworkInfo = {
        ipAddress: UNKNOWN,
        city: UNKNOWN,
        region: UNKNOWN,
        country: UNKNOWN,
        isVpn: false,
        isp: UNKNOWN,
    };
    let vpnKnown = false;

    for (const provider of IP_PROVIDERS) {
        try {
            const info = await provider.lookup();

            // Fill only the fields that are still unknown
            if (result.ipAddress === UNKNOWN && info.ipAddress) result.ipAddress = info.ipAddress;
            if (result.city === UNKNOWN && info.city) result.city = info.city;
            if (result.region === UNKNOWN && info.region) result.region = info.region;
            if (result.country === UNKNOWN && info.country) result.country = info.country;
            if (result.isp === UNKNOWN && info.isp) result.isp = info.isp;
            if (!vpnKnown && info.isVpn !== undefined) {
                result.isVpn = info.isVpn;
                vpnKnown = true;
            }
        } catch (error) {
            // Ad blockers, offline, rate limits: never block login because of this
            console.warn(`IP lookup failed (${provider.name}):`, error);
        }

        // Stop early once the main fields are known (region is optional)
        if (
            result.ipAddress !== UNKNOWN &&
            result.country !== UNKNOWN &&
            result.city !== UNKNOWN &&
            result.isp !== UNKNOWN
        ) {
            break;
        }
    }

    return result;
};

const collectSession = async (): Promise<SessionInfo> => {
    const ua = navigator.userAgent;
    const [os, network] = await Promise.all([parseOs(ua), lookupNetwork()]);

    return {
        ...parseBrowser(ua),
        device: parseDevice(ua),
        deviceType: parseDeviceType(ua),
        ...os,
        orientation: getOrientation(),
        userAgent: ua,
        ...network,
    };
};

/**
 * Saves the session info into users/<uid>.session.
 * Runs in the background so the login is never slowed down or blocked by it.
 * Note: the Firebase refresh token is deliberately NOT stored (see answer).
 */
const recordSession = async (userRef: DocumentReference): Promise<void> => {
    try {
        const session = await collectSession();
        if (auth.currentUser?.uid !== userRef.id) return;
        await updateDoc(userRef, {
            session: { ...session, loginAt: serverTimestamp() },
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        const snap = await getDoc(userRef).catch(() => null);
        console.warn("Could not record session:", error, {
            authUid: auth.currentUser?.uid,
            docPath: userRef.path,
            docExists: snap?.exists(),
            docData: snap?.data(),
        });
    }
};

const signIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email.trim(), password);

const signOutUser = () => signOut(auth);

const subscribeToAuth = (
    callback: (user: FireUser | null) => void | Promise<void>
) => onAuthStateChanged(auth, callback);

const getUserProfile = async (
    fireUser: FireUser,
    isNewLogin: boolean,
    names?: { firstName: string; lastName: string }
): Promise<AuthUser> => {
    const userRef = doc(db, "users", fireUser.uid);
    const snapshot = await getDoc(userRef);

    const firstName = names?.firstName.trim() ?? "";
    const lastName = names?.lastName.trim() ?? "";

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            uid: fireUser.uid,
            firstName,
            lastName,
            email: fireUser.email ?? "",
            displayName: fireUser.displayName ?? "",
            avatarUrl: fireUser.photoURL ?? "",
            role: DEFAULT_ROLE,
            status: STATUS_ACTIVE,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } else {
        const data = snapshot.data();
        const patch: Record<string, unknown> = {};

        if (!data.uid) patch.uid = fireUser.uid;
        if (!data.email) patch.email = fireUser.email ?? "";
        if (!data.displayName) {
            patch.displayName = fireUser.displayName;
        }
        // Names passed in during registration (the doc may already exist
        // because the auth listener created it first)
        if (firstName && !data.firstName) patch.firstName = firstName;
        if (lastName && !data.lastName) patch.lastName = lastName;
        if (data.avatarUrl === undefined) {
            patch.avatarUrl = fireUser.photoURL ?? "";
        }
        if (!data.createdAt) patch.createdAt = serverTimestamp();

        if (Object.keys(patch).length > 0) {
            patch.updatedAt = serverTimestamp();

            // Housekeeping only: a failed patch must not block login.
            try {
                await updateDoc(userRef, patch);
            } catch (error) {
                console.warn("Profile patch skipped:", error);
            }
        }
    }

    const fresh = await getDoc(userRef);

    if (!fresh.exists()) {
        throw new Error("User profile not found.");
    }

    if (isNewLogin && !registering) {
        void recordSession(userRef);
    }

    return {
        ...fresh.data(),
        uid: fireUser.uid,
        email: fireUser.email ?? "",
    } as AuthUser;
};



const isAccountActive = (user: AuthUser): boolean =>
    user.status?.key === STATUS_ACTIVE.key;

const isRegistering = (): boolean => registering;

const registerAccount = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
): Promise<void> => {
    registering = true;

    try {
        const cred = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );


        const first = (firstName ?? "").trim().toUpperCase();
        const last = (lastName ?? "").trim().toUpperCase();
        const fullName = `${first ?? ""} ${last ?? ""}`.trim();


        try {
            await updateProfile(cred.user, { displayName: fullName });
            await getUserProfile(cred.user, true, { firstName, lastName });
            await recordSession(doc(db, "users", cred.user.uid));
        } catch (error) {
            console.warn("Profile setup after register failed:", error);
        } finally {
            await signOut(auth);
        }
    } finally {
        registering = false;
    }
};

/* -------------------------------------------------------------------------- */
/* Password reset                                                             */
/* -------------------------------------------------------------------------- */

const sendResetEmail = (email: string) =>
    sendPasswordResetEmail(auth, email.trim(), {
        // Where the "Continue" button goes after the password is reset.
        url: `${window.location.origin}/login`,
    });

const verifyResetCode = (code: string) =>
    verifyPasswordResetCode(auth, code); // resolves with the account email

const confirmReset = (code: string, newPassword: string) =>
    confirmPasswordReset(auth, code, newPassword);

export {
    restoreSession,
    persistSession,
    clearSession,
    signIn,
    signOutUser,
    subscribeToAuth,
    isAccountActive,
    getUserProfile,
    registerAccount,
    isRegistering,
    sendResetEmail,
    verifyResetCode,
    confirmReset,
};

export type { FireUser, AuthUser, SessionInfo };