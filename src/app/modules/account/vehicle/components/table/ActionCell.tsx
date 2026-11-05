import { memo, useState } from "react";
import {
    Button,
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
import ConfirmDeleteDialog from "../../../../../../_egdi_ilb/helpers/shared/alert/ConfirmDeleteDialog";
import type { Vehicle } from "../../core/model";

type Props = {
    row: Vehicle;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (id: string) => void;
};

export default memo(function ActionCell({ row, onEdit, onDelete }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);

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
                                Edit
                            </MenuItem>
                            <MenuItem
                                icon={<DeleteRegular fontSize={16} />}
                                onClick={() => setDeleteOpen(true)}
                                className="text-danger"
                            >
                                Delete
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>
            <ConfirmDeleteDialog
                open={deleteOpen}
                title="vehicle"
                name={`${row.name} (${row.licensePlate})`}
                onConfirm={() => {
                    onDelete(row.id);
                    setDeleteOpen(false);
                }}
                onCancel={() => setDeleteOpen(false)}
            />
        </>
    );
});