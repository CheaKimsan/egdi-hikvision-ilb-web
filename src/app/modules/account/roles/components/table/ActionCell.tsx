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
    DeleteRegular,
    EditRegular,
    MoreVertical20Regular,
} from "@fluentui/react-icons";
import type { Role } from "../../core/model";

type Props = {
    row: Role;
    assignedUserCount: number;
    onEdit: (role: Role) => void;
    onDelete: (id: string) => void;
};

export default memo(function ActionCell({
    row,
    assignedUserCount,
    onEdit,
    onDelete,
}: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
                                Edit role
                            </MenuItem>
                            <MenuItem
                                icon={<DeleteRegular fontSize={16} />}
                                onClick={() => setDeleteDialogOpen(true)}
                                className="text-danger"
                            >
                                Delete role
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>

            <Dialog
                open={deleteDialogOpen}
                onOpenChange={(_, data) => setDeleteDialogOpen(data.open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Delete role</DialogTitle>
                        <DialogContent>
                            {assignedUserCount > 0 ? (
                                <>
                                    <b>{row.name}</b> is assigned to {assignedUserCount}{" "}
                                    {assignedUserCount === 1 ? "user" : "users"}. Reassign those users
                                    before deleting this role.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete <b>{row.name}</b>?
                                    This action cannot be undone.
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                appearance="secondary"
                                onClick={() => setDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            {assignedUserCount === 0 && (
                                <Button
                                    appearance="primary"
                                    className="ilb-btn-danger"
                                    onClick={() => {
                                        onDelete(row.id);
                                        setDeleteDialogOpen(false);
                                    }}
                                >
                                    Delete role
                                </Button>
                            )}
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
});
