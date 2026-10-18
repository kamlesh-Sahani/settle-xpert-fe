"use client";
import { useState, useEffect } from "react";
import DynamicSideBar from "@/common/dynamic/DynamicSideBar";
import { usePathname, useRouter } from "next/navigation";
import { useSideMenu } from "@/store/menus/sideMenu.store";
import { useUserStore } from "@/store/user.store";
import api, { userApi } from "@/common/utils/api";
import { useFetch } from "@/hooks/useFetch";
import ModuleSwitcherModal from "@/components/modals/ModuleSwitcherModal";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import { FiLogOut } from "react-icons/fi";

import { ErrorApi } from "@/common/ui/ErrorApi";

const withOutNavbarAndFooter = new Set([
  "/login",
  "/register",
  "/verify-otp",
  "/verify",
  "/form-builder",
]);

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { menus, currentMenu, toggleMenu } = useSideMenu();
  const { isInitialized, setUserData, clearUserData } = useUserStore();
  const permissions = useUserStore((state) => state.permissions);
  const router = useRouter();
  const pathname = usePathname();
  const [isModuleSwitcherOpen, setIsModuleSwitcherOpen] = useState(false);

  const handleSelectModule = (moduleKey: string) => {
    toggleMenu(moduleKey);
    if (moduleKey === "MAIN") router.push("/dashboard");
    else if (moduleKey === "SECONDARY") router.push("/admin/team");
  };

  useEffect(() => {
    if (pathname.startsWith("/admin") && currentMenu !== "SECONDARY") {
      toggleMenu("SECONDARY");
    } else if (!pathname.startsWith("/admin") && currentMenu !== "MAIN") {
      toggleMenu("MAIN");
    }
  }, [pathname, currentMenu, toggleMenu]);

  const isProtectedRoute = !withOutNavbarAndFooter.has(pathname);
  const user = useUserStore((state) => state.user);

  const { error, refetch } = useFetch({
    client: api.get,
    url: "/api/v1/users/config",
    dontCall: !isProtectedRoute || isInitialized,
    onSuccess: (res: any) => {
      if (res?.success) {
        setUserData(res.data);
      } else {
        clearUserData();
      }
    },
  });

  useEffect(() => {
    // Only redirect if session was successfully checked and determined to be unauthenticated (not on server errors)
    if (isProtectedRoute && isInitialized && !user && !error) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [isProtectedRoute, isInitialized, user, error, pathname, router]);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch {
      // ignore
    }
    clearUserData();
    router.replace("/login");
  };

  if (!isProtectedRoute) {
    return <>{children}</>;
  }

  // Show error UI with Retry & Logout buttons on server errors instead of bouncing to /login in an infinite loop
  if (isProtectedRoute && error) {
    return (
      <ErrorApi
        fullScreen
        title="Workspace Access Error"
        message={error || "Workspace not found or inactive. Please contact to admin."}
        onRetry={refetch}
        action={
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg cursor-pointer transition-all duration-200 hover:bg-danger/20 active:scale-95"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        }
      />
    );
  }

  if (isProtectedRoute && (!isInitialized || !user)) {
    return <LoadingSpinner fullScreen />;
  }

  const moduleOptions = [
    { key: "MAIN", label: "Employee" },
    { key: "SECONDARY", label: "Admin Setting" },
    { key: "SUPER", label: "Super Admin" }
  ];

  const filteredMenuItems = menus[currentMenu]?.filter((item: any) => {
    if (!item.permission) return true;
    return permissions.has(item.permission);
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex h-full">
        <DynamicSideBar
          items={filteredMenuItems}
          modules={moduleOptions}
          currentModule={currentMenu}
          onModuleClick={() => setIsModuleSwitcherOpen(true)}
          onProfileSettingClick={() => router.push('/super/profile')}
          defaultSelectedKeys={
            currentMenu === "MAIN"
              ? ["customers"]
              : filteredMenuItems?.[0]?.key
                ? [String(filteredMenuItems[0].key)]
                : undefined
          }
        />
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</div>
      </div>

      <ModuleSwitcherModal
        isOpen={isModuleSwitcherOpen}
        onClose={() => setIsModuleSwitcherOpen(false)}
        currentModule={currentMenu}
        onSelectModule={handleSelectModule}
      />
    </div>
  );
};

export default MainLayout;
