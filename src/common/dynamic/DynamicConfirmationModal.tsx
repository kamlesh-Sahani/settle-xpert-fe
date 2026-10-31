import React from "react";
import ButtonField from "@/common/basic/ButtonField";
import DynamicModal from "./DynamicModal";
import FormStatusMessage, { SubmitStatusType } from "@/common/form/FormStatusMessage";

import classNames from "classnames";

export interface DynamicConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  status?: SubmitStatusType | null;
  onDismissStatus?: () => void;
  zIndex?: number;
  close?: "icon" | "text";
  className?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

export default function DynamicConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  confirmText = "Yes",
  cancelText = "No",
  isLoading = false,
  status,
  onDismissStatus,
  zIndex = 60,
  close = "icon",
  className,
  confirmButtonClassName,
  cancelButtonClassName,
}: DynamicConfirmationModalProps) {
  return (
    <DynamicModal
      isOpen={isOpen}
      onClose={onClose}
      role="alertdialog"
      zIndex={zIndex}
      close={close}
      shouldCloseOnOverlayClick={!isLoading}
      className={classNames("w-[540px] max-w-[92vw] h-fit !border-0 !border-none", className)}
      title={title}
      style={{ overlay: { alignItems: 'flex-start', paddingTop: '10vh' }, content: { border: 'none' } }}
    >
      <div className="flex flex-col w-full gap-2 pt-2">

        <div className="text-text-secondary">
          {message}
        </div>

        {status && (
          <div className="mt-2">
            <FormStatusMessage status={status} onDismiss={onDismissStatus} />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-8 pb-1">
          <ButtonField
            type="default"
            onClick={onClose}
            disabled={isLoading}
            className={classNames(
              "font-medium text-xs text-text-primary bg-secondary hover:bg-secondary/80 border border-border/80 px-4 h-9 rounded-lg transition-colors",
              cancelButtonClassName
            )}
          >
            {cancelText}
          </ButtonField>
          <ButtonField
            type="primary"
            onClick={onConfirm}
            loading={isLoading}
            className={classNames(
              "bg-primary hover:bg-primary-hover text-white font-medium text-xs border-none px-5 h-9 rounded-lg transition-colors whitespace-nowrap min-w-[90px]",
              confirmButtonClassName
            )}
          >
            {confirmText}
          </ButtonField>
        </div>
      </div >
    </DynamicModal >
  );
}
