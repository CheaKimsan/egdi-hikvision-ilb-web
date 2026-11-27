import { useMemo, useState } from "react";
import { Dropdown, Option } from "@fluentui/react-components";
import { StatusOption, statusOptions } from "../../../../constants/Status";
import { ChevronDownIcon } from "lucide-react";

export const ALL_STATUS = "all";

export const matchesStatus = (
    status: { key: number } | undefined | null,
    filter: string,
) => filter === ALL_STATUS || String(status?.key) === filter;

type StatusFilterProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    allLabel?: string;
    statuses?: StatusOption[];
};

const StatusFilter: React.FC<StatusFilterProps> = ({
    value,
    onChange,
    className = "status-filter",
    allLabel = "All Status",
    statuses = statusOptions,

}) => {
    const options = useMemo(
        () => [
            { value: ALL_STATUS, name: allLabel },
            ...statuses.map((option) => ({
                value: String(option.key),
                name: option.name,
            })),
        ],
        [allLabel, statuses],
    );

    const [open, setOpen] = useState(false);


    return (
        <Dropdown
            aria-label="Filter by status"
            appearance="outline"
            className={className}
            open={open}
            onOpenChange={(_, data) => setOpen(data.open)}
            expandIcon={
                <ChevronDownIcon
                    className={`status-filter-chevron${open ? " is-open" : ""}`}
                />
            }
            value={options.find((o) => o.value === value)?.name ?? ""}
            selectedOptions={[value]}
            onOptionSelect={(_, data) => onChange(data.optionValue ?? ALL_STATUS)}
        >
            {options.map((option) => (
                <Option key={option.value} value={option.value}>
                    {option.name}
                </Option>
            ))}
        </Dropdown>
    );
};

export default StatusFilter;