"use client";

import React from "react";
import ReactModal from "react-modal";
import { BsX } from "react-icons/bs";
import classNames from "classnames";
import styles from "./DynamicModal.module.css";

// ─── Sub-component: Header ────────────────────────────────────────────────────

interface ModalHeaderProps {
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
  onClose?: () => void;
  close?: "icon" | "text";
  hideCloseButton?: boolean;
  className?: string;
}

function ModalHeader({
  title,
  headerAction,
  onClose,
  close,
  hideCloseButton = false,
  className,
}: ModalHeaderProps) {
  const showClose = !hideCloseButton && (close === "icon" || close === "text");
  console.log({ close })

  return (
    <div className={classNames(styles.modal__header, className)}>
      {title ? (
        <span className={styles["modal__header-title"]}>{title}</span>
      ) : (
        <span />
      )}
      {(headerAction || showClose) && (
        <div className="flex items-center gap-2.5 shrink-0">
          {headerAction}
          {showClose && close === "icon" && (
            <button
              type="button"
              onClick={onClose}
              className={styles["modal__header-close"]}
              aria-label="Close modal"
            >
              <BsX size={26} strokeWidth={1} style={{ fontWeight: 900 }} />
            </button>
          )}
          {showClose && close === "text" && (
            <button
              type="button"
              onClick={onClose}
              className={styles["modal__header-close-btn"]}
              aria-label="Close modal"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: Body ──────────────────────────────────────────────────────

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={classNames(styles.modal__body, className)}>
      {children}
    </div>
  );
}

// ─── Sub-component: Footer ────────────────────────────────────────────────────

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={classNames(styles.modal__footer, className)}>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface DynamicModalProps extends ReactModal.Props {
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  close?: "icon" | "text";
  hideCloseButton?: boolean;
  bodyClassName?: string;
  headerClassName?: string;
  zIndex?: number;
}

function DynamicModal({
  isOpen,
  onClose,
  title,
  headerAction,
  footer,
  children,
  close,
  hideCloseButton = false,
  className,
  bodyClassName,
  headerClassName,
  zIndex,
  ...props
}: DynamicModalProps) {
  const hasCloseAction = !hideCloseButton && (close === "icon" || close === "text");

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      closeTimeoutMS={200}
      ariaHideApp={false}
      style={{
        overlay: { zIndex: zIndex ?? 50, ...props.style?.overlay },
        content: { ...props.style?.content },
      }}
      overlayClassName={styles.modal__overlay}
      className={classNames(styles.modal__content, className)}
      {...props}
    >
      {/* Header — rendered only when a title is provided or close button is active or headerAction is provided */}
      {(title || hasCloseAction || headerAction) && (
        <ModalHeader
          title={title}
          headerAction={headerAction}
          onClose={onClose}
          close={close}
          hideCloseButton={hideCloseButton}
          className={headerClassName}
        />
      )}

      {/* Body */}
      <ModalBody className={bodyClassName}>
        {children}
      </ModalBody>

      {/* Footer */}
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </ReactModal>
  );
}

// ─── Attach sub-components ────────────────────────────────────────────────────
DynamicModal.Header = ModalHeader;
DynamicModal.Body = ModalBody;
DynamicModal.Footer = ModalFooter;

export default DynamicModal;
