import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mainMenu, adminMenu } from "./constant";
import { MenuProps } from "antd";

export interface sideMenuStoreTypes {
    menus: Record<string, MenuProps["items"]>;
    currentMenu: string;
    toggleMenu: (menu: string) => void;
}

export const useSideMenu = create<sideMenuStoreTypes>()(
    persist(
        (set) => ({
            menus: {
                "MAIN": mainMenu,
                "SECONDARY": adminMenu,
            },
            currentMenu: "MAIN",
            toggleMenu: (menu: string) => {
                set({ currentMenu: menu });
            },
        }),
        {
            name: "side-menu-storage",
            partialize: (state) => ({ currentMenu: state.currentMenu }),
        }
    )
);