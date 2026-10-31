"use client";

import React from "react";
import { Drawer, Switch, Input, Radio, Select, Divider } from "antd";
import { HeaderConfig, FooterConfig, DocumentSettings } from "./templateEditor.types";

interface DocumentSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  header: HeaderConfig;
  onHeaderChange: (header: HeaderConfig) => void;
  footer: FooterConfig;
  onFooterChange: (footer: FooterConfig) => void;
  settings: DocumentSettings;
  onSettingsChange: (settings: DocumentSettings) => void;
}

export default function DocumentSettingsDrawer({
  open,
  onClose,
  header,
  onHeaderChange,
  footer,
  onFooterChange,
  settings,
  onSettingsChange,
}: DocumentSettingsDrawerProps) {
  return (
    <Drawer
      title="Document & Page Setup"
      placement="right"
      width={340}
      onClose={onClose}
      open={open}
    >
      <div className="flex flex-col gap-5 text-xs text-gray-700">
        {/* Header Configuration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-sm">Header Settings</span>
            <Switch
              size="small"
              checked={header.enabled}
              onChange={(checked) => onHeaderChange({ ...header, enabled: checked })}
            />
          </div>

          {header.enabled && (
            <div className="flex flex-col gap-2.5 pl-1 border-l-2 border-primary-200">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Header Title
                </label>
                <Input
                  size="small"
                  value={header.title}
                  onChange={(e) => onHeaderChange({ ...header, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Subtitle
                </label>
                <Input
                  size="small"
                  value={header.subtitle}
                  onChange={(e) => onHeaderChange({ ...header, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Logo URL
                </label>
                <Input
                  size="small"
                  placeholder="https://example.com/logo.png"
                  value={header.logoUrl || ""}
                  onChange={(e) => onHeaderChange({ ...header, logoUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Alignment
                </label>
                <Radio.Group
                  size="small"
                  value={header.alignment}
                  onChange={(e) => onHeaderChange({ ...header, alignment: e.target.value })}
                >
                  <Radio.Button value="left">Left</Radio.Button>
                  <Radio.Button value="center">Center</Radio.Button>
                  <Radio.Button value="right">Right</Radio.Button>
                </Radio.Group>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-600">Show Divider Line</span>
                <Switch
                  size="small"
                  checked={header.showDivider}
                  onChange={(checked) => onHeaderChange({ ...header, showDivider: checked })}
                />
              </div>
            </div>
          )}
        </div>

        <Divider className="my-1" />

        {/* Footer Configuration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900 text-sm">Footer Settings</span>
            <Switch
              size="small"
              checked={footer.enabled}
              onChange={(checked) => onFooterChange({ ...footer, enabled: checked })}
            />
          </div>

          {footer.enabled && (
            <div className="flex flex-col gap-2.5 pl-1 border-l-2 border-primary-200">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Footer Text / Disclaimer
                </label>
                <Input.TextArea
                  rows={2}
                  size="small"
                  value={footer.text}
                  onChange={(e) => onFooterChange({ ...footer, text: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-600">Show Page Numbers</span>
                <Switch
                  size="small"
                  checked={footer.showPageNumbers}
                  onChange={(checked) =>
                    onFooterChange({ ...footer, showPageNumbers: checked })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <Divider className="my-1" />

        {/* Page & Typography Settings */}
        <div>
          <span className="font-bold text-gray-900 text-sm block mb-3">Page & Layout</span>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Orientation
              </label>
              <Radio.Group
                size="small"
                value={settings.orientation}
                onChange={(e) =>
                  onSettingsChange({ ...settings, orientation: e.target.value })
                }
              >
                <Radio.Button value="portrait">Portrait (A4)</Radio.Button>
                <Radio.Button value="landscape">Landscape</Radio.Button>
              </Radio.Group>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Margins
              </label>
              <Select
                size="small"
                className="w-full"
                value={settings.margins}
                onChange={(val) => onSettingsChange({ ...settings, margins: val })}
                options={[
                  { label: "Compact (12mm)", value: "compact" },
                  { label: "Normal (20mm)", value: "normal" },
                  { label: "Wide (28mm)", value: "wide" },
                ]}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Base Font Size
              </label>
              <Select
                size="small"
                className="w-full"
                value={settings.fontSize}
                onChange={(val) => onSettingsChange({ ...settings, fontSize: val })}
                options={[
                  { label: "12px - Small", value: 12 },
                  { label: "14px - Regular", value: 14 },
                  { label: "16px - Large", value: 16 },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
