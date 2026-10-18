"use client";

import { memo, useState } from "react";
import { EyeOutlined, PictureOutlined, AppstoreOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import dynamic from "next/dynamic";
import type { ModalCellType } from "../types";
import DynamicModal from "../../DynamicModal";

const DynamicFilePreviewer = dynamic(() => import("../../DynamicFilePreviewer"), { ssr: false });

// ─── Icon per modal type ────────────────────────────────────────────────────

const MODAL_TYPE_ICONS: Record<string, React.ReactNode> = {
  IMAGE: <PictureOutlined />,
  IMAGES: <AppstoreOutlined />,
  CUSTOM: <EyeOutlined />,
};

function ModalCell({ label, icon, modalType, data }: ModalCellType) {
  const [isOpen, setIsOpen] = useState(false);

  const resolvedIcon = icon
    ? MODAL_TYPE_ICONS[icon] ?? <EyeOutlined />
    : MODAL_TYPE_ICONS[modalType] ?? <EyeOutlined />;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const renderModal = () => {
    if (!isOpen) return null;

    if (modalType === "IMAGE") {
      const files = [{ url: data?.src, name: data?.alt || 'Image' }];
      return <DynamicFilePreviewer isOpen={isOpen} onClose={handleClose} files={files} />;
    }

    if (modalType === "IMAGES") {
      const files = (data?.images || []).map((img: any, i: number) => ({
        url: img.src,
        name: img.alt || `Image ${i + 1}`
      }));
      return <DynamicFilePreviewer isOpen={isOpen} onClose={handleClose} files={files} />;
    }

    // CUSTOM fallback
    return (
      <DynamicModal isOpen={isOpen} onClose={handleClose} title={label || "Data Preview"} hideCloseButton={false}>
        <div className="p-4 bg-background h-full overflow-auto">
          <pre className="text-sm text-text-secondary bg-secondary p-4 rounded-lg">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </DynamicModal>
    );
  };

  return (
    <>
      <Tooltip title={label ?? "Preview"}>
        <button
          onClick={handleOpen}
          className="cursor-pointer"
        >
          {resolvedIcon}
        </button>
      </Tooltip>
      {renderModal()}
    </>
  );
}

export default memo(ModalCell);
