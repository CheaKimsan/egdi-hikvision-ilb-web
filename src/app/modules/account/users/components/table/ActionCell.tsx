import { memo, useState } from "react";
import {
    Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
    Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions,
} from "@fluentui/react-components";
import {
    EditRegular,
    DeleteRegular,
    MoreVertical20Regular,
    DismissRegular,
    CheckmarkRegular,
} from "@fluentui/react-icons";
import type { AuthUser } from "../../../../auth/AuthContext";
import ConfirmDeleteDialog from "../../../../../../_egdi_ilb/helpers/shared/alert/ConfirmDeleteDialog";

type Props = {
    row: AuthUser;
    onEdit: (row: AuthUser) => void;
    onDelete: (id: string) => Promise<void> | void;
    onToggleStatus: (id: string, status: AuthUser["status"]) => void;
};

export default memo(function ActionCell({ row, onEdit, onDelete, onToggleStatus }: Props) {
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
                            aria-label="Row actions"
                            className="ilb-kebab-btn"
                        />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem
                                icon={<EditRegular fontSize={16} />}
                                onClick={() => onEdit(row)}
                            >
                                Edit
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
                                Delete
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>


            <ConfirmDeleteDialog
                open={openDelete}
                title="user"
                name={row.displayName}
                loading={loading}
                onConfirm={handleConfirmDelete}
                onCancel={() => !loading && setOpenDelete(false)}
            />

            <Dialog
                open={openStatusConfirmation}
                onOpenChange={(_, data) => setOpenStatusConfirmation(data.open)}
            >
                <DialogSurface data-no-row-click="true">
                    <DialogBody>
                        <DialogTitle>{statusAction} user</DialogTitle>
                        <DialogContent>
                            Are you sure you want to {statusAction.toLowerCase()}{" "}
                            <b>{row.displayName}</b>?
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