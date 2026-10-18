"use client";

import React from "react";
import { Drawer } from "antd";
import type { DrawerProps } from "antd";
import { GoArrowLeft } from "react-icons/go";
import classNames from "classnames";

export interface DynamicDrawerProps extends Omit<DrawerProps, "open" | "onClose"> {
  isOpen: boolean;
  onClose: () => void;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  ExtraTitleChild?: React.ReactNode;
}

export default function DynamicDrawer({
  isOpen,
  onClose,
  title,
  footer,
  children,
  placement = "right",
  width = "80vw",
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  titleClassName,
  ExtraTitleChild,
  ...props
}: DynamicDrawerProps) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      styles={{
        wrapper: { width },
        ...props.styles,
      }}
      placement={placement}
      closeIcon={false}
      title={
        <div className={classNames("flex items-center  w-full bg-background ", titleClassName)} >
          <div className="flex  cursor-pointer items-center gap-2 " onClick={onClose}>
            <GoArrowLeft className="text-[18px]" />
            <span className="text-[14px] font-semibold text-text-primary">{title}</span>
          </div>

          {ExtraTitleChild}
        </div>
      }
      footer={footer}
      className={className}
      classNames={{
        header: classNames("px-6 py-4 border-b-2 border-border bg-secondary w-full ", headerClassName),
        body: classNames("px-6 py-0 overflow-y-auto ", bodyClassName),
        footer: classNames("px-6 py-4 border-t border-border bg-secondary flex items-center justify-end gap-3", footerClassName),
        ...props.classNames,
      }}
      {...props}
    >
      {children}
    </Drawer>
  );
}
