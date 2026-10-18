"use client";

import { memo, useState, useCallback, Fragment } from "react";
import { Tooltip, App } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import api from "@/common/utils/api";
import type { ActionCellType, ApiMethod } from "../types";
import DynamicConfirmationModal from "../../DynamicConfirmationModal";
import ButtonField from "@/common/basic/ButtonField";
import DeleteIcon from "@/assets/icons/deleteIcon";

export interface ActionCellProps extends ActionCellType {
  record?: any;
  onActionClick?: ({ actionKey, actionData, actionType }: { actionKey?: string, actionData?: Record<string, any>, actionType?: string }) => void;
}

// ─── Icon registry (extensible via key) ─────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  EditOutlined: <EditOutlined />,
  DeleteOutlined: <DeleteIcon width={16} height={16} />,
  DeleteIcon: <DeleteIcon width={16} height={16} />,
  EyeOutlined: <EyeOutlined />,
  DownloadOutlined: <DownloadOutlined />,
  CopyOutlined: <CopyOutlined />,
  CheckOutlined: <CheckOutlined />,
  CloseOutlined: <CloseOutlined />,
  ReloadOutlined: <ReloadOutlined />,
  MoreOutlined: <MoreOutlined />,
};

// ─── Default action-to-icon mapping ─────────────────────────────────────────

const ACTION_ICON_DEFAULTS: Record<string, string> = {
  edit: "EditOutlined",
  delete: "DeleteIcon",
  view: "EyeOutlined",
  download: "DownloadOutlined",
  copy: "CopyOutlined",
  approve: "CheckOutlined",
  reject: "CloseOutlined",
  refresh: "ReloadOutlined",
};

// ─── Action colors ──────────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, { color: string; hoverBg: string }> = {
  delete: { color: "#ef4444", hoverBg: "#fef2f2" },
  reject: { color: "#ef4444", hoverBg: "#fef2f2" },
  approve: { color: "#22c55e", hoverBg: "#f0fdf4" },
  default: { color: "#6b7280", hoverBg: "#f9fafb" },
};

function ActionCell({ actionKey, icon, label, confirmMessage, actionData, onActionClick, actionType }: ActionCellProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [isConfirmationModal, setIsConfirmationModal] = useState(false);

  const resolvedIcon = icon
    ? ICON_MAP[icon]
    : ICON_MAP[ACTION_ICON_DEFAULTS[actionKey]] ?? <MoreOutlined />;

  const colors = ACTION_COLORS[actionKey] ?? ACTION_COLORS.default;

  const executeAction = useCallback(async () => {
    if (!actionData?.apiUrl) {
      if (onActionClick) onActionClick({ actionKey, actionData, actionType });
      return;
    }

    setLoading(true);
    try {
      const method: ApiMethod = actionData.apiType ?? "get";
      const client = api[method];

      if (method === "get" || method === "delete") {
        await client(actionData.apiUrl, { params: actionData.params });
      } else {
        await client(actionData.apiUrl, actionData.data ?? {}, { params: actionData.params });
      }

      message.success(`${actionKey} completed`);
      if (onActionClick) onActionClick({ actionKey, actionData, actionType });
    } catch {
      message.error(`${actionKey} failed`);
    } finally {
      setLoading(false);
    }
  }, [actionData, actionKey, onActionClick, actionData]);

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "transparent",
    color: colors.color,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.5 : 1,
    transition: "all 0.2s",
    fontSize: 14,
  };

  const buttonHandler = () => {
    if (confirmMessage) {
      setIsConfirmationModal(true)
    } else {
      executeAction();
    }
  }

  const button = (
    <Tooltip title={label ?? actionKey}>
      <ButtonField
        style={buttonStyle}
        disabled={loading}
        onClick={buttonHandler}
      >
        {resolvedIcon}
      </ButtonField>
    </Tooltip >
  );

  if (confirmMessage) {
    return (
      <Fragment>
        {button}
        {
          isConfirmationModal &&
          <DynamicConfirmationModal
            isOpen={isConfirmationModal}
            title={label || "Are you sure to performe this action"}
            message={confirmMessage}
            onConfirm={executeAction}
            onClose={() => setIsConfirmationModal(false)}

          />
        }

      </Fragment>

    );
  }

  return button;
}

export default memo(ActionCell);
