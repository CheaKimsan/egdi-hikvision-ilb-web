type DateInput =
    | Date
    | string
    | number
    | { toDate: () => Date }                    // Firestore Timestamp
    | { seconds: number; nanoseconds?: number } // Timestamp serialized to a plain object
    | null
    | undefined;

const toDate = (value: DateInput): Date | null => {
    if (value == null) return null;

    let date: Date;

    if (value instanceof Date) {
        date = value;
    } else if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
        date = value.toDate();
    } else if (typeof value === "object" && "seconds" in value) {
        date = new Date(value.seconds * 1000);
    } else {
        date = new Date(value as string | number);
    }

    return Number.isNaN(date.getTime()) ? null : date;
};

function formatDateTime(
    value: DateInput,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    },
): string {
    const date = toDate(value);
    return date ? date.toLocaleString("en-GB", options) : "—";
}

const pluralize = (value: number, unit: string) =>
    `${value} ${unit}${value === 1 ? "" : "s"} ago`;

function formatRelativeTime(date: Date, now: number = Date.now()): string {
    const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60_000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return pluralize(minutes, "minute");
    if (hours < 24) return pluralize(hours, "hour");
    return pluralize(days, "day");
}

const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

export { formatDate, formatTime, formatRelativeTime, toDate, formatDateTime };