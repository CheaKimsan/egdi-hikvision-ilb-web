import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@fluentui/react-components";
import CustomBtn from "../button/CustomBtn";

export type ConfirmCreateDialogProps = {
    open: boolean;
    title?: string;
    name?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmCreateDialog({
    open,
    title,
    name,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onCancel()}>
            <DialogSurface className="confirm-dialog-surface">
                <DialogBody>
                    <DialogTitle>Create {title}</DialogTitle>

                    <DialogContent>
                        Are you sure you want to create{" "}
                        <b>{name ?? ""}</b>? This action cannot be undone.
                    </DialogContent>

                    <DialogActions >
                        <div className="flex gap-2">
                            <CustomBtn
                                label="Cancel"
                                type="next"
                                width={90}
                                height={32}
                                onClick={onCancel}
                                disabled={loading}
                            />

                            <CustomBtn
                                label={loading ? "Creating..." : "Yes, Create"}
                                type="submit"
                                width={120}
                                height={32}
                                onClick={onConfirm}
                                disabled={loading}
                            />
                        </div>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
