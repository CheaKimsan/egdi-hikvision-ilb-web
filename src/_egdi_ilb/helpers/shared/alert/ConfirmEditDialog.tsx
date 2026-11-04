import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import CustomBtn from "../button/CustomBtn";

export type ConfirmEditDialogProps = {
    open: boolean;
    name?: string;
    title?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmEditDialog({
    open,
    name,
    title,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(_, d) => !d.open && onCancel()}>
            <DialogSurface className="confirm-dialog-surface">
                <DialogBody>
                    <DialogTitle>Edit {title ?? ""}</DialogTitle>

                    <DialogContent>
                        Are you sure you want to save changes to{" "}
                        <b>{name ?? "this dock"}</b>? This action cannot be undone.
                    </DialogContent>

                    <DialogActions>
                        <CustomBtn
                            label="Cancel"
                            type="next"
                            width={90}
                            height={32}
                            onClick={onCancel}
                            disabled={loading}
                        />

                        <CustomBtn
                            label={loading ? "Saving..." : "Yes, Save"}
                            type="submit"
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
