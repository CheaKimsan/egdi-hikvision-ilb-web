import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import CustomBtn from "../button/CustomBtn";

export type ConfirmDeleteDialogProps = {
    open: boolean;
    title?: string;
    name?: string;
    loading?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDeleteDialog({
    open,
    title,
    name,
    loading = false,
    error,
    onConfirm,
    onCancel,
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(_, d) => !d.open && onCancel()}>
            <DialogSurface data-no-row-click="true" className="confirm-dialog-surface">
                <DialogBody>
                    <DialogTitle>Delete {title}</DialogTitle>

                    <DialogContent>
                        Are you sure you want to delete{" "}
                        <b>{name ?? "this dock"}</b>? This action cannot be undone.
                        {error && <div className="settings-error" style={{ marginTop: 8 }}>{error}</div>}
                    </DialogContent>

                    <DialogActions>
                        <CustomBtn
                            label="Cancel"
                            type="edit"
                            width={90}
                            height={32}
                            onClick={onCancel}
                            disabled={loading}
                        />

                        <CustomBtn
                            label={loading ? "Deleting..." : "Yes, Delete"}
                            type="delete"
                            width={120}
                            height={32}
                            onClick={onConfirm}
                            disabled={loading}
                        />
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
