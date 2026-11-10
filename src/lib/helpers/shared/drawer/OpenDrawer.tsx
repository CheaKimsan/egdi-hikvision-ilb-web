import React from "react";
import {
    Button,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";

export type OpenDrawerProps = {
    open: boolean;
    title: React.ReactNode;
    titleIcon?: React.ReactNode;
    width?: number | string;
    className?: string;
    onClose: () => void;
    layout?: "default" | "tabs";
    children?: React.ReactNode;
    tabs?: React.ReactNode;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    showFooter?: boolean;

    headerActions?: React.ReactNode;
};

export default function OpenDrawer({
    open,
    title,
    titleIcon,
    width,
    className = "",
    onClose,
    layout = "default",
    children,
    tabs,
    content,
    footer,
    showFooter = true,
    headerActions,
}: OpenDrawerProps) {
    const drawerWidthValue =
        typeof width === "number" ? `${width}px` : width;

    return (
        <Drawer
            open={open}
            onOpenChange={(_, d) => !d.open && onClose()}
            position="end"
            size="medium"
            className={`app-universal-drawer ${className}`}
            style={{ "--drawer-width": drawerWidthValue } as React.CSSProperties}
        >
            <div
                className={`app-drawer-layout ${layout === "tabs" ? "tabs-layout" : "default-layout"
                    }`}
            >
                {/* HEADER */}
                <DrawerHeader className="app-drawer-header">
                    <DrawerHeaderTitle
                        action={
                            <div className="app-drawer-header-actions">
                                {headerActions}
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<DismissRegular />}
                                    aria-label="Close drawer"
                                    title="Close"
                                    className="app-drawer-close-button"
                                    onClick={onClose}
                                />
                            </div>
                        }
                    >
                        <span className="app-drawer-title-content">
                            {titleIcon && (
                                <span className="app-drawer-title-icon" aria-hidden="true">
                                    {titleIcon}
                                </span>
                            )}
                            {title}
                        </span>
                    </DrawerHeaderTitle>
                </DrawerHeader>

                {/* DEFAULT (OLD) */}
                {layout === "default" && (
                    <DrawerBody className="app-drawer-body">
                        {children}
                    </DrawerBody>
                )}

                {/* TABS (SETTINGS) */}
                {layout === "tabs" && (
                    <>
                        {tabs && (
                            <div className="app-drawer-tabs-scroll">
                                {tabs}
                            </div>
                        )}
                        {content && (
                            <div className="app-drawer-content-fixed">
                                {content}
                            </div>
                        )}
                    </>
                )}

                {/* FOOTER */}
                {showFooter && footer && (
                    <div className="app-drawer-footer">
                        {footer}
                    </div>
                )}
            </div>
        </Drawer>
    );
}
