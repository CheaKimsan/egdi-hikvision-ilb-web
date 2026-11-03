import { memo, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Menu,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger,
} from "@fluentui/react-components";
import {
    CheckmarkRegular,
    DeleteRegular,
    DismissRegular,
    EditRegular,
    MoreVertical20Regular,
} from "@fluentui/react-icons";
import type { ManagedDevice } from "../../core/model";

type Props = {
    row: ManagedDevice;
    onEdit: (row: ManagedDevice) => void;
    onDelete: (id: string) => Promise<void> | void;
    onToggleStatus: (id: string, status: ManagedDevice["status"]) => void;
};

export default memo(function ActionCell({
    row,
    onEdit,
    onDelete,
    onToggleStatus,
}: Props) {
    const [openDelete, setOpenDelete] = useState(false);
    const [openStatusConfirmation, setOpenStatusConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const nextStatus = row.status === "active" ? "inactive" : "active";
    const statusAction = row.status === "active" ? "Deactivate" : "Activate";

    async function handleConfirmDelete() {
        setLoading(true);
        try {
            await onDelete(row.id);
            setOpenDelete(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="ilb-action-cell" data-no-row-click="true">
                <Menu positioning={{ position: "below", align: "end" }}>
                    <MenuTrigger disableButtonEnhancement>
                        <Button
                            appearance="subtle"
                            size="small"
                            icon={<MoreVertical20Regular />}
                            aria-label={`Actions for ${row.name}`}
                            className="ilb-kebab-btn"
                        />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem
                                icon={<EditRegular fontSize={16} />}
                                onClick={() => onEdit(row)}
                            >
                                Edit device
                            </MenuItem>
                            <MenuItem
                                icon={
                                    row.status === "active"
                                        ? <DismissRegular fontSize={16} />
                                        : <CheckmarkRegular fontSize={16} />
                                }
                                onClick={() => setOpenStatusConfirmation(true)}
                            >
                                {statusAction}
                            </MenuItem>
                            <MenuItem
                                icon={<DeleteRegular fontSize={16} />}
                                onClick={() => setOpenDelete(true)}
                                className="text-danger"
                            >
                                Delete device
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>

            <Dialog
                open={openDelete}
                onOpenChange={(_, data) => !loading && setOpenDelete(data.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Delete device</DialogTitle>
                        <DialogContent>
                            Are you sure you want to delete <b>{row.name}</b>? This action cannot be undone.
                        </DialogContent>
                        <DialogActions>
                            <Button
                                appearance="secondary"
                                disabled={loading}
                                onClick={() => setOpenDelete(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                disabled={loading}
                                onClick={handleConfirmDelete}
                                className="ilb-btn-danger"
                            >
                                {loading ? "Deleting…" : "Delete"}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Dialog
                open={openStatusConfirmation}
                onOpenChange={(_, data) => setOpenStatusConfirmation(data.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>{statusAction} device</DialogTitle>
                        <DialogContent>
                            Are you sure you want to {statusAction.toLowerCase()} <b>{row.name}</b>?
                        </DialogContent>
                        <DialogActions>
                            <Button
                                appearance="secondary"
                                onClick={() => setOpenStatusConfirmation(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={() => {
                                    onToggleStatus(row.id, nextStatus);
                                    setOpenStatusConfirmation(false);
                                }}
                            >
                                {statusAction}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
});
