import {
    SearchBox,
    type SearchBoxProps,
} from "@fluentui/react-components";
import React, { useEffect, useState } from "react";

export type SearchFieldProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    debounceMs?: number;
    autoFocus?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
};

export default function SearchField({
    value,
    onChange,
    placeholder = "Search…",
    style,
    debounceMs = 0,
    autoFocus,
    disabled,
    ariaLabel = "Search",
}: SearchFieldProps) {
    const [inner, setInner] = useState(value);

    useEffect(() => setInner(value), [value]);

    useEffect(() => {
        if (debounceMs <= 0) return;
        const id = setTimeout(() => {
            if (inner !== value) onChange(inner);
        }, debounceMs);
        return () => clearTimeout(id);
    }, [inner, value, onChange, debounceMs]);

    const commitImmediate = (next: string) => {
        setInner(next);
        if (debounceMs <= 0) onChange(next);
    };

    const handleChange: SearchBoxProps["onChange"] = (_ev, data) => {
        commitImmediate((data as any).value ?? "");
    };

    return (
        <SearchBox
            aria-label={ariaLabel}
            value={inner}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className="custom-search frame"
            style={style}
            appearance="outline"
            size="large"
            autoFocus={autoFocus}
        />
    );
}
