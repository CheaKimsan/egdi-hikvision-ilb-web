import { Button, Spinner } from "@fluentui/react-components";
import type {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  TouchEventHandler,
} from "react";

export type CustomBtnType =
  | "add"
  | "edit"
  | "delete"
  | "submit"
  | "cancel"
  | "next"
  | "primary"
  | "close"
  | "danger";

export type CustomBtnProps = {
  label?: ReactNode;
  icon?: ReactNode;
  type?: CustomBtnType;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  form?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  selected?: boolean;
  loading?: boolean;
  size?: "sm" | "small" | "medium";
  variant?: "fluent" | "dark";
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
};

const darkBase =
  "font-medium rounded border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 justify-center whitespace-nowrap cursor-pointer active:scale-95 select-none";
const darkDefault =
  "bg-[#262d36] hover:bg-[#2d353f] border-white/10 text-slate-200";
const darkDanger =
  "bg-[#75101d]/40 hover:bg-[#75101d]/60 border-[#a84450]/50 text-[#f3c7cc]";
const darkSelected =
  "bg-[#75101d] hover:bg-[#620b17] border-[#8e2b37] text-white";
const darkSizeSm = "px-2 py-0.5 text-[10px]";
const darkSizeDefault = "px-2.5 py-1 text-[11px]";

export default function CustomBtn({
  label,
  icon,
  type = "primary",
  onClick,
  onKeyDown,
  disabled = false,
  form,
  width,
  height,
  className = "",
  selected = false,
  loading = false,
  size,
  variant = "fluent",
  onHoldStart,
  onHoldEnd,
}: CustomBtnProps) {
  const isDisabled = disabled || loading;

  if (variant === "dark") {
    const sizeClass = size === "sm" ? darkSizeSm : darkSizeDefault;
    const colorClass = selected
      ? darkSelected
      : type === "danger" || type === "delete"
        ? darkDanger
        : darkDefault;
    const onTouchStart: TouchEventHandler<HTMLButtonElement> | undefined =
      onHoldStart
        ? (event) => {
          event.preventDefault();
          onHoldStart();
        }
        : undefined;
    const onTouchEnd: TouchEventHandler<HTMLButtonElement> | undefined =
      onHoldEnd
        ? (event) => {
          event.preventDefault();
          onHoldEnd();
        }
        : undefined;
    const holdHandlers =
      onHoldStart && onHoldEnd
        ? {
          onMouseDown: onHoldStart,
          onMouseUp: onHoldEnd,
          onMouseLeave: onHoldEnd,
          onTouchStart,
          onTouchEnd,
        }
        : {};
    const style: CSSProperties | undefined =
      width != null || height != null
        ? { width: width ?? undefined, height: height ?? undefined }
        : undefined;

    return (
      <button
        className={`${sizeClass} ${darkBase} ${colorClass} ${className}`}
        disabled={isDisabled}
        onClick={onClick}
        onKeyDown={onKeyDown}
        form={form}
        style={style}
        type={type === "submit" ? "submit" : "button"}
        {...holdHandlers}
      >
        {loading && <Spinner size="tiny" />}
        {icon && <span className="inline-flex text-inherit">{icon}</span>}
        {label && <span className="text-inherit">{label}</span>}
      </button>
    );
  }

  const style: CSSProperties = {
    width: width ?? "unset",
    height: height ?? 32,
  };
  const appearance =
    type === "add" ||
      type === "submit" ||
      type === "primary" ||
      type === "delete" ||
      type === "danger"
      ? "primary"
      : "secondary";
  const typeClass =
    type === "delete" || type === "danger"
      ? "custom-btn--danger"
      : `custom-btn--${type}`;
  const sizeClass = size === "medium" ? "custom-btn--medium" : "";
  const selectedClass = selected ? "custom-btn--selected" : "";

  return (
    <Button
      appearance={appearance}
      disabled={isDisabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      form={form}
      size={size === "medium" ? "medium" : "small"}
      type={type === "submit" ? "submit" : "button"}
      className={`custom-btn ${typeClass} ${sizeClass} ${selectedClass} ${className}`}
      style={style}
    >
      {loading && <Spinner size="tiny" />}
      {icon && <span className="custom-btn__content">{icon}</span>}
      {label && <span className="custom-btn__content">{label}</span>}
    </Button>
  );
}