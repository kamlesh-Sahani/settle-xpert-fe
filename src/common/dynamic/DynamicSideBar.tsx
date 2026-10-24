"use client";

import { useMemo, useState, Suspense, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Menu,
  Tooltip,
  Avatar,
  Popover,
  Divider,
  ConfigProvider,
  App,
} from "antd";
import type { MenuProps } from "antd";
import ExchangeIcon from "@/assets/icons/ExchangeIcon";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import {
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEmployeeStore } from "@/store/employee.store";
import { employeeApi } from "@/common/utils/api";
import { isString, isNotEmptyArray } from "@/common/utils/main.utils";
import DynamicConfirmationModal from "./DynamicConfirmationModal";
import { useNavigationStore } from "@/store/useNavigationStore";
import { APP_CONFIG } from "@/config/app.config";
import BrandLogo from "@/common/basic/BrandLogo";
import classNames from "classnames";

/**
 * Build a flat key → route map from nested menu items.
 * In Ant Design v5+/v6, custom props like `route` are NOT accessible
 * via `e.item.props` when using the `items` API, so we extract them upfront.
 */
function buildRouteMap(items: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  if (!items) return map;

  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      if (!node) continue;
      if (node.route) map[node.key] = node.route;
      if (node.children) walk(node.children);
    }
  };
  walk(items);
  return map;
}


type DynamicSideBarProps = {
  collapsed?: boolean;
  items: MenuProps["items"];
  mode?: "inline" | "vertical" | "horizontal";
  defaultSelectedKeys?: string[];
  defaultOpenKeys?: string[];
  selectedKeys?: string[];
  onClick?: MenuProps["onClick"];
  className?: string;
  collapsabled?: boolean;
  modules?: { key: string; label: string }[];
  currentModule?: string;
  onModuleClick?: () => void;
  onProfileClick?: () => void;
  onProfileSettingClick?: () => void;
  prefix?: string,
  isSearch?: boolean,
  onlySidebar?: boolean,
  width?: string | number;
};

const DynamicSideBarContent: React.FC<DynamicSideBarProps> = ({
  items,
  mode = "inline",
  defaultSelectedKeys,
  defaultOpenKeys,
  selectedKeys: propSelectedKeys,
  onClick,
  className,
  collapsabled = true,
  modules,
  currentModule,
  onModuleClick,
  onProfileSettingClick,
  prefix = "",
  isSearch,
  onlySidebar = false,
  width,
}) => {
  const { message } = App.useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Navigation interception state
  const { isFormDirty, setIsFormDirty } = useNavigationStore();
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [pendingRouteEvent, setPendingRouteEvent] = useState<any>(null);

  const { employee, clearEmployeeData } = useEmployeeStore((state) => state);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await employeeApi.logout();
      clearEmployeeData();
      message.success("Logged out successfully");
      const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    } catch (error) {
      console.error("Logout failed on backend", error);
      clearEmployeeData();
      message.success("Logged out successfully");
      const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const [optimisticSelectedKey, setOptimisticSelectedKey] = useState<
    string | null
  >(null);
  const [optimisticOpenKeys, setOptimisticOpenKeys] = useState<string[] | null>(
    null,
  );

  useEffect(() => {
    setOptimisticSelectedKey(null);
    setOptimisticOpenKeys(null);
  }, [pathname]);

  // Build route map once from items
  const routeMap = useMemo(() => buildRouteMap(items as any[]), [items]);

  // Auto-redirect if visiting a parent route (e.g. /billing) where no menu item matches directly,
  // but a default selected key or child route exists
  useEffect(() => {
    if (!onlySidebar && !propSelectedKeys) {
      const normalizedPath = pathname.replace(/\/$/, "");
      const hasDirectMatch = Object.values(routeMap).some((r) => {
        if (!r) return false;
        const clean = r.split('?')[0].replace(/\/$/, "");
        return normalizedPath === clean || normalizedPath.startsWith(clean + '/');
      });

      if (!hasDirectMatch) {
        // First check defaultSelectedKeys
        const defaultKey = defaultSelectedKeys?.[0];
        const defaultRoute = defaultKey ? routeMap[defaultKey] : undefined;
        if (defaultRoute) {
          const cleanDefault = defaultRoute.split('?')[0].replace(/\/$/, "");
          if (cleanDefault.startsWith(normalizedPath + '/')) {
            router.replace(defaultRoute);
            return;
          }
        }

        // Fallback: check if any route in routeMap is under this pathname
        const childRoute = Object.values(routeMap).find((r) => {
          if (!r) return false;
          const clean = r.split('?')[0].replace(/\/$/, "");
          return clean.startsWith(normalizedPath + '/');
        });
        if (childRoute) {
          router.replace(childRoute);
        }
      }
    }
  }, [pathname, onlySidebar, propSelectedKeys, defaultSelectedKeys, routeMap, router]);

  const proceedWithNavigation = useCallback((e: any) => {
    setOptimisticSelectedKey(e.key); // Optimistic UI update

    if (onClick) {
      onClick(e);
    } else {
      const route = routeMap[e.key];
      const params = new URLSearchParams(searchParams.toString());
      params.set("selectedMenu" + prefix, e.key);

      if (route) {
        if (route.includes('?')) {
          const [path, queryStr] = route.split('?');
          const routeParams = new URLSearchParams(queryStr);

          // Route definition query params must take precedence over existing params
          routeParams.forEach((value, key) => {
            params.set(key, value);
          });

          router.push(`${path}?${params.toString()}`);
        } else {
          router.push(`${route}?${params.toString()}`);
        }
      } else {
        router.push(`${pathname}?${params.toString()}`);
      }
    }
  }, [onClick, routeMap, searchParams, router, prefix, pathname]);

  const handleMenuClick: MenuProps["onClick"] = useCallback(
    (e: any) => {
      if (!onlySidebar && isFormDirty) {
        setPendingRouteEvent(e);
        setIsDiscardModalOpen(true);
      } else {
        proceedWithNavigation(e);
      }
    },
    [onlySidebar, isFormDirty, proceedWithNavigation],
  );

  const handleConfirmDiscard = () => {
    setIsFormDirty(false);
    setIsDiscardModalOpen(false);
    if (pendingRouteEvent) {
      proceedWithNavigation(pendingRouteEvent);
      setPendingRouteEvent(null);
    }
  };

  const handleCancelDiscard = () => {
    setIsDiscardModalOpen(false);
    setPendingRouteEvent(null);
  };

  const handleOpenChange = (parentKey: string[]) => {
    setOptimisticOpenKeys(parentKey); // Optimistic UI update

    const params = new URLSearchParams(searchParams.toString());
    if (parentKey.length) {
      params.set("selectedParentKey", parentKey.join(","));
    } else {
      params.delete("selectedParentKey");
    }
    window.history.replaceState(
      null,
      "",
      window.location.pathname + "?" + params.toString(),
    );
  };

  const { selectedKeys, openKeys } = useMemo(() => {
    let activeKeyFromPath: string | null = null;
    let exactMatch: string | null = null;
    let partialMatch: string | null = null;

    const normalizedPath = pathname.replace(/\/$/, "");
    for (const [key, route] of Object.entries(routeMap)) {
      if (!route) continue;
      const cleanRoute = route.split('?')[0].replace(/\/$/, "");
      if (normalizedPath === cleanRoute) {
        exactMatch = key;
        break;
      }
      if (normalizedPath.startsWith(cleanRoute + '/')) {
        partialMatch = key;
      }
    }
    activeKeyFromPath = exactMatch || partialMatch;

    const menuKey =
      propSelectedKeys?.[0] ||
      optimisticSelectedKey ||
      activeKeyFromPath ||
      searchParams.get("selectedMenu" + prefix) ||
      defaultSelectedKeys?.[0];
    const openKeysStr = searchParams.get("selectedParentKey");
    const openKeysArr =
      optimisticOpenKeys ||
      (openKeysStr ? openKeysStr.split(",") : defaultOpenKeys);

    return {
      selectedKeys: (propSelectedKeys || (menuKey ? [String(menuKey)] : [])) as string[],
      openKeys: openKeysArr as string[] | undefined,
    };
  }, [
    propSelectedKeys,
    searchParams,
    pathname,
    routeMap,
    defaultSelectedKeys,
    defaultOpenKeys,
    optimisticSelectedKey,
    optimisticOpenKeys,
    prefix
  ]);

  const filteredItems = useMemo(() => {
    if (!searchValue) return items;

    const filterTree = (nodes: any[]): any[] => {
      if (!nodes) return [];
      return nodes
        .map((node) => {
          if (!node) return null;

          // Get text value from label (could be ReactNode, so we safely handle it)
          const labelText =
            isString(node.label)
              ? node.label
              : node.label?.props?.children || node.key || "";
          const matches = String(labelText)
            .toLowerCase()
            .includes(searchValue.toLowerCase());

          let filteredChildren;
          if (node.children) {
            filteredChildren = filterTree(node.children);
          }

          if (matches || isNotEmptyArray(filteredChildren)) {
            return {
              ...node,
              children:
                isNotEmptyArray(filteredChildren)
                  ? filteredChildren
                  : undefined,
            };
          }
          return null;
        })
        .filter(Boolean);
    };

    return filterTree(items as any[]);
  }, [items, searchValue]);

  const employeeInitials = useMemo(() => {
    if (!employee?.name) return "";
    const parts = employee.name.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.[0]?.toUpperCase() || "");
  }, [employee?.name]);

  const popoverContent = (
    <div className="flex flex-col w-[268px] overflow-hidden rounded-xl bg-white text-slate-800">
      <div className="p-3.5 pb-3">
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="flex-shrink-0 font-bold text-white text-sm"
            style={{ backgroundColor: "#e11438" }}
          >
            {employeeInitials}
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-sm text-slate-800 truncate leading-snug">
              {employee?.name}
            </span>
            <span className="text-xs text-slate-500 truncate leading-tight mt-0.5">
              {employee?.email}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-200 my-3" />

        <div className="flex justify-between items-center text-sm px-0.5">
          <span className="text-slate-500 font-normal">Department</span>
          <span className="font-semibold text-slate-800">
            {employee?.departmentName || "General"}
          </span>
        </div>
      </div>

      <div
        onClick={() => {
          setIsPopoverOpen(false);
          setIsLogoutModalOpen(true);
        }}
        className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#f4f6fa] hover:bg-[#ebedf3] cursor-pointer transition-colors border-t border-slate-100"
      >
        <LuLogOut className="text-slate-800 text-lg stroke-[2.2]" />
        <span className="text-xs sm:text-[13px]">
          <span className="font-bold text-slate-800">Logout</span>{" "}
          <span className="font-normal text-slate-500">From Your Account</span>
        </span>
      </div>
    </div>
  );

  return (
    <div
      className={`flex flex-col relative h-full bg-sidebar-bg border-r border-sidebar-border transition-[width] duration-150 ${className || ""}`}
      style={{ width: collapsed ? "80px" : width || (onlySidebar ? "200px" : "200px") }}
    >
      {collapsabled && (
        <Tooltip title={collapsed ? "Expand" : "Collapse"} placement="right">
          <div
            onClick={() => setCollapsed((prev) => !prev)}
            className="cursor-pointer flex justify-center items-center w-6 h-6 rounded bg-primary hover:bg-primary-hover text-white absolute -right-3 top-4 z-20 shadow-md transition-colors"
          >
            {collapsed ? (
              <IoIosArrowForward className="text-white" />
            ) : (
              <IoIosArrowBack className="text-white" />
            )}
          </div>
        </Tooltip>
      )}
      {!onlySidebar && (
        <div className="flex items-center px-4 h-16 shrink-0 border-b border-sidebar-border overflow-hidden">
          <BrandLogo size="md" collapsed={collapsed} />
        </div>
      )}

      {isSearch && (
        <div className="px-4 py-3 shrink-0 border-b border-sidebar-border bg-sidebar-bg/40">
          <div className="relative flex items-center w-full h-9 rounded-lg bg-sidebar-bg hover:bg-sidebar-hover focus-within:bg-sidebar-hover focus-within:shadow-sm focus-within:ring-1 focus-within:ring-primary/40 transition-all border border-sidebar-border">
            <SearchOutlined className="absolute left-3 text-sidebar-text-muted/70 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-full pl-9 pr-3 bg-transparent border-none outline-none text-sm text-sidebar-text placeholder-gray-400"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        <style>{`
                    .custom-sidebar-menu .ant-menu-item {
                        width: 100%;
                        margin-inline: 0 !important;
                        margin-block: 0 !important;
                        border-radius: 0 !important;
                        height: 40px;
                    }
                    .custom-sidebar-menu .ant-menu-submenu-title {
                        width: 100%;
                        margin-inline: 0 !important;
                        border-radius: 0 !important;
                    }
                    .custom-sidebar-menu .ant-menu-item-disabled,
                    .custom-sidebar-menu .ant-menu-submenu-disabled,
                    .custom-sidebar-menu .ant-menu-submenu-disabled > .ant-menu-submenu-title {
                        opacity: 0.4 !important;
                        cursor: not-allowed !important;
                        pointer-events: none !important;
                    }
                    .custom-sidebar-menu .ant-menu-item-selected {
                        position: relative;
                    }
                    .custom-sidebar-menu .ant-menu-item-selected::before {
                        content: "";
                        position: absolute;
                        left: 0;
                        top: 50%;
                        transform: translateY(-50%);
                        height: 24px;
                        width: 4px;
                        background-color: white;
                        border-top-right-radius: 4px;
                        border-bottom-right-radius: 4px;
                        z-index: 10;
                    }
                    /* Remove the default Ant Design right border for selected items */
                    .custom-sidebar-menu.ant-menu-inline .ant-menu-item::after {
                        display: none !important;
                    }
                    .custom-sidebar-menu .ant-menu-item:not(.ant-menu-item-selected):hover,
                    .custom-sidebar-menu .ant-menu-submenu-title:hover {
                        background-color: var(--sidebar-hover) !important;
                        color: var(--sidebar-text) !important;
                    }
                `}</style>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemBg: "transparent",
                subMenuItemBg: "transparent",
                itemHoverBg: "var(--sidebar-hover)",
                itemSelectedBg: "var(--primary)",
                itemSelectedColor: "#fff",
                itemColor: "var(--sidebar-text)",
                itemHoverColor: "var(--sidebar-text)",
                itemMarginInline: 0,
                itemBorderRadius: 0,
                itemHeight: 48,
              },
            },
          }}
        >
          <Menu
            mode={mode}
            items={filteredItems}
            inlineCollapsed={collapsed}
            defaultSelectedKeys={defaultSelectedKeys}
            defaultOpenKeys={defaultOpenKeys}
            selectedKeys={selectedKeys}
            onClick={handleMenuClick}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            className="border-r-0 bg-transparent custom-sidebar-menu"
          />
        </ConfigProvider>
      </div>
      {!onlySidebar && (
        <div className="flex flex-col shrink-0 bg-sidebar-bg">
          {!collapsed && (
            <>
              <div className="px-4 py-1.5 bg-sidebar-bg hover:bg-sidebar-hover border-t border-sidebar-border flex items-center justify-between cursor-pointer transition-colors" onClick={onModuleClick}>
                <div
                  className="flex flex-col items-center justify-between font-bold text-sm cursor-pointer mt-1 text-sidebar-text hover:text-primary transition-colors"
                >
                  <span className="text-[12px] font-bold text-sidebar-text-muted">
                    Current Module
                  </span>
                  {modules?.find((m) => m.key === currentModule)?.label}
                </div>
                <ExchangeIcon className="text-sidebar-text text-xl font-bold" />
              </div>
              <div
                onClick={onProfileSettingClick}
                className="flex items-center gap-3 px-4 py-3 border-t border-sidebar-border cursor-pointer hover:bg-sidebar-hover transition-colors"
              >
                <SettingOutlined className="text-sidebar-text text-lg" />
                <span className="font-bold text-sm text-sidebar-text flex-1">
                  Profile Setting
                </span>
                <IoIosArrowForward className="text-sidebar-text-muted/70" />
              </div>
            </>
          )}

          <Popover
            content={popoverContent}
            placement="rightBottom"
            trigger="click"
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
            styles={{ container: { padding: 0, borderRadius: "12px", overflow: "hidden" } }}
          >
            <div
              className={`flex items-center gap-3 py-2 px-4 border-t border-sidebar-border cursor-pointer bg-sidebar-bg hover:bg-sidebar-hover transition-colors ${collapsed ? "justify-center" : ""}`}
            >
              <Avatar
                size={34}
                className="flex-shrink-0 font-bold text-white text-xs"
                style={{ backgroundColor: "#e11438" }}
              >
                {employeeInitials}
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-sm truncate text-sidebar-text">
                    {employee?.name}
                  </span>
                  <span className="text-xs text-sidebar-text-muted truncate">
                    {employee?.email}
                  </span>
                </div>
              )}
            </div>
          </Popover>
        </div>
      )}

      <DynamicConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onClose={() => setIsLogoutModalOpen(false)}
        isLoading={isLoggingOut}
      />

      <DynamicConfirmationModal
        isOpen={isDiscardModalOpen}
        onClose={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
        title="Changes Are Not Saved !"
        message="The current page contains unsaved changes that will be lost if you leave this page. Do you really want to discard your changes?"
        confirmText="Discard"
        cancelText="Cancel"
      />
    </div>
  );
};

const DynamicSideBar: React.FC<DynamicSideBarProps> = (props) => {
  return (
    <Suspense
      fallback={<div className="h-full w-[260px] bg-secondary animate-pulse" />}
    >
      <DynamicSideBarContent {...props} />
    </Suspense>
  );
};

export default DynamicSideBar;
