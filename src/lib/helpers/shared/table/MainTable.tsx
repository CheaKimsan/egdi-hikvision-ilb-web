import * as React from "react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
} from "@fluentui/react-components";
import PaginationBar, { PaginationBarProps } from "../pagination/PaginationBar";
import { useEffect, useState } from "react";
import NoData from "../no-data/NoData";
import Loader from "../loader/Loader";
import {
    PAGE_SIZE_OPTIONS,
    usePreferencesStore,
} from "../../../../app/state/preferenceStore";

export type Column<T> = {
    title: React.ReactNode;
    key?: string;
    dataIndex?: keyof T;
    render?: (row: T, rowIndex: number) => React.ReactNode;
    className?: string;
    width?: number | string;
    align?: "left" | "center" | "right";
};

export type PaginationProps = Omit<
    PaginationBarProps,
    "total" | "page" | "pageSize" | "onPageChange" | "onPageSizeChange"
> & {
    page?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    position?: "top" | "bottom" | "both";
};

export type MainTableProps<T> = {
    rows: T[];
    columns: Column<T>[];
    rowKey: (row: T, index: number) => React.Key;
    emptyText?: string;
    onRowClick?: (row: T, index: number) => void;
    className?: string;
    pagination?: PaginationProps | boolean;
    loading?: boolean;  // ← add
};

export default function MainTable<T>({
    rows,
    columns,
    rowKey,
    emptyText,
    onRowClick,
    className,
    pagination,
    loading = false,
}: MainTableProps<T>) {
    const [showLoading, setShowLoading] = useState(true);
    const paginationEnabled = !!pagination;

    const preferredPageSize = usePreferencesStore((s) => s.defaultPageSize);
    const setDefaultPageSize = usePreferencesStore((s) => s.setDefaultPageSize);
    const [page, setPageInternal] = useState(0);

    useEffect(() => {
        if (loading) {
            setShowLoading(true);
            return;
        }

        const timeoutId = setTimeout(() => setShowLoading(false), 3000);
        return () => clearTimeout(timeoutId);
    }, [loading]);

    const setPage = typeof pagination === "object" && pagination.onPageChange
        ? pagination.onPageChange
        : setPageInternal;

    const setPageSize = (size: number) => {
        if (typeof pagination === "object" && pagination.onPageSizeChange) {
            pagination.onPageSizeChange(size);
            return;
        }

        setDefaultPageSize(size);
    };

    const currentPage = typeof pagination === "object" && pagination.page !== undefined
        ? pagination.page
        : page;

    const currentPageSize = typeof pagination === "object" && pagination.pageSize !== undefined
        ? pagination.pageSize
        : preferredPageSize;

    useEffect(() => {
        setPage(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows.length, currentPageSize]);

    const total = rows.length;
    const pageSizeOptions =
        (typeof pagination === "object" && pagination.pageSizeOptions) ||
        PAGE_SIZE_OPTIONS;
    const position =
        (typeof pagination === "object" && pagination.position) || "bottom";
    const align =
        (typeof pagination === "object" && pagination.align) || "right";
    const pageSizeLabel =
        (typeof pagination === "object" && pagination.pageSizeLabel) ||
        undefined;

    const pageCount = Math.max(1, Math.ceil(total / currentPageSize));
    const cur = Math.min(currentPage, pageCount - 1);

    const sliced = paginationEnabled
        ? rows.slice(cur * currentPageSize, cur * currentPageSize + currentPageSize)
        : rows;

    return (
        <div
            className={className}
            style={{
                overflow: "hidden",
                background: "var(--card-bg, rgba(255,255,255,0.02))",
            }}
        >
            {paginationEnabled && (position === "top" || position === "both") && (
                <PaginationBar
                    total={total}
                    page={cur}
                    pageSize={currentPageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={pageSizeOptions}
                    pageSizeLabel={pageSizeLabel}
                    align={align}
                    className="dp-table-pagination"
                />
            )}

            <Table aria-label="Main data table">
                <TableHeader>
                    <TableRow>
                        {columns.map((col, ci) => (
                            <TableHeaderCell
                                key={col.key ?? String(ci)}
                                style={{
                                    ...(col.width ? { width: col.width } : null),
                                    ...(col.align ? { textAlign: col.align } : null),
                                }}
                            >
                                {col.title}
                            </TableHeaderCell>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {showLoading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                                    <Loader />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : sliced.length ? (
                        sliced.map((row, ri) => {
                            const globalIndex = paginationEnabled
                                ? cur * currentPageSize + ri
                                : ri;

                            return (
                                <TableRow
                                    key={rowKey(row, globalIndex)}
                                    onClick={(e) => {
                                        if (!onRowClick) return;
                                        const target = e.target as HTMLElement;
                                        if (target.closest("[data-no-row-click='true']")) return;
                                        onRowClick(row, globalIndex);
                                    }}
                                    style={onRowClick ? { cursor: "pointer" } : undefined}
                                >
                                    {columns.map((col, ci) => {
                                        const content = col.render
                                            ? col.render(row, globalIndex)
                                            : col.dataIndex !== undefined
                                                ? (row as any)[col.dataIndex]
                                                : null;

                                        return (
                                            <TableCell
                                                key={(col.key ?? String(ci)) + "-cell"}
                                                className={col.className}
                                                style={{
                                                    ...(col.width ? { width: col.width } : null),
                                                    ...(col.align ? { textAlign: col.align } : null),
                                                }}
                                            >
                                                {content ?? "—"}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell className="text-center" colSpan={columns.length}>
                                <NoData title={emptyText ?? "No data found"} />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {paginationEnabled && (position === "bottom" || position === "both") && (
                <PaginationBar
                    total={total}
                    page={cur}
                    pageSize={currentPageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={pageSizeOptions}
                    pageSizeLabel={pageSizeLabel}
                    align={align}
                    className="dp-table-pagination"
                />
            )}
        </div>
    );
}
