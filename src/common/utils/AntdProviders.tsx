"use client";
import { useThemeStore } from "@/store/theme/theme.store";
import { useStore } from "@/store/useStore";
import { ConfigProvider, theme, App } from "antd";
import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const { appSettings } = useStore();
  const { primaryColor } = useThemeStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle(
        "dark",
        appSettings.mode === "dark",
      );
    }
  }, [appSettings.mode, mounted]);

  if (!mounted) return null;
  return (
    <ConfigProvider
      theme={{
        algorithm:
          appSettings.mode === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: {
          colorPrimary: primaryColor,
          colorSuccess: "#16A34A",
          colorWarning: "#F59E0B",
          colorError: "#DC2626",
          colorBorder: "#7F8583",
          colorBorderSecondary: "var(--background-secondary)",
          borderRadius: 5,
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          controlHeight: 36
        },
        components: {
          Tooltip: {
            colorBgSpotlight: "var(--background-secondary)",
            colorTextLightSolid: "var(--text-primary)",
          },
        },
      }}
    >
      <style id="antd-custom-scrollbar">{`
        :root, body, .ant-select-dropdown, .custom-select-dropdown {
          --rc-virtual-list-scrollbar-bg: ${primaryColor || "#e62e4d"} !important;
        }
        .ant-select-dropdown-list-scrollbar,
        .ant-select-dropdown-list-scrollbar-vertical,
        .ant-select-dropdown [class*="-scrollbar"],
        .custom-select-dropdown [class*="-scrollbar"] {
          width: 3px !important;
          right: 1px !important;
        }
        .ant-select-dropdown-list-scrollbar-thumb,
        .ant-select-dropdown [class*="-scrollbar-thumb"],
        .custom-select-dropdown [class*="-scrollbar-thumb"] {
          width: 3px !important;
          background: ${primaryColor || "#e62e4d"} !important;
          background-color: ${primaryColor || "#e62e4d"} !important;
          border-radius: 9999px !important;
        }
      `}</style>
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
