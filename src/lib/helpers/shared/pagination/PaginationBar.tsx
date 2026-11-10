import React from "react";
import { ChevronLeftRegular, ChevronRightRegular, ChevronDoubleLeftRegular, ChevronDoubleRightRegular, } from "@fluentui/react-icons";

export type PaginationBarProps = {
    total: number;
    page: number; // zero-based
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    pageSizeLabel?: string;
    align?: "left" | "right" | "space-between";
    className?: string;
    style?: React.CSSProperties;
};

const PaginationBar: React.FC<PaginationBarProps> = ({
    total,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 15, 25, 50],
    pageSizeLabel,
    className,
    style,
}) => {
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const cur = Math.min(page, pageCount - 1);
    const from = total === 0 ? 0 : cur * pageSize + 1;
    const to = Math.min(total, (cur + 1) * pageSize);
    const canPrev = cur > 0;
    const canNext = cur < pageCount - 1;

    const navBtn = (enabled: boolean): React.CSSProperties => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: 3,
        border: "none",
        background: "transparent",
        color: enabled ? "#334155" : "#cbd5e1",
        cursor: enabled ? "pointer" : "not-allowed",
        transition: "background 0.15s, color 0.15s",
        flexShrink: 0,
    });

    return (
        <div
            className={className}
            style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "6px 12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                gap: 2,
                ...style,
            }}
        >
            {/* Items per page */}
            {onPageSizeChange && (
                <>
                    <span style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap", marginRight: 4 }}>
                        {pageSizeLabel ?? "Items per page:"}
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        style={{
                            height: 22,
                            padding: "0 16px 0 6px",
                            borderRadius: 3,
                            border: "none",
                            background: "transparent",
                            color: "#1e293b",
                            fontSize: 11,
                            cursor: "pointer",
                            outline: "none",
                            marginRight: 12,
                        }}
                    >
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt} style={{ background: "#ffffff", color: "#1e293b" }}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </>
            )}

            {/* Range info */}
            <span style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap", marginRight: 8 }}>
                {total === 0 ? "No results" : `${from} – ${to} of ${total}`}
            </span>

            {/* First page */}
            <button
                onClick={() => canPrev && onPageChange(0)}
                disabled={!canPrev}
                style={navBtn(canPrev)}
                aria-label="First page"
                onMouseEnter={(e) => { if (canPrev) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
                <ChevronDoubleLeftRegular fontSize={14} />
            </button>

            {/* Prev */}
            <button
                onClick={() => canPrev && onPageChange(cur - 1)}
                disabled={!canPrev}
                style={navBtn(canPrev)}
                aria-label="Previous page"
                onMouseEnter={(e) => { if (canPrev) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
                <ChevronLeftRegular fontSize={14} />
            </button>

            {/* Next */}
            <button
                onClick={() => canNext && onPageChange(cur + 1)}
                disabled={!canNext}
                style={navBtn(canNext)}
                aria-label="Next page"
                onMouseEnter={(e) => { if (canNext) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
                <ChevronRightRegular fontSize={14} />
            </button>

            {/* Last page */}
            <button
                onClick={() => canNext && onPageChange(pageCount - 1)}
                disabled={!canNext}
                style={navBtn(canNext)}
                aria-label="Last page"
                onMouseEnter={(e) => { if (canNext) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
                <ChevronDoubleRightRegular fontSize={14} />
            </button>
        </div>
    );
};

export default PaginationBar;
