"use client";

import React from "react";
import DynamicModal from "@/common/dynamic/DynamicModal";
import { FileTextOutlined, SettingOutlined, BankOutlined } from "@ant-design/icons";
import classNames from "classnames";

interface ModuleSwitcherModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentModule: string;
    onSelectModule: (moduleKey: string) => void;
}

const ModuleSwitcherModal: React.FC<ModuleSwitcherModalProps> = ({
    isOpen,
    onClose,
    currentModule,
    onSelectModule,
}) => {

    const modules = [
        {
            key: "MAIN",
            title: "Employee",
            description: "End-to-end management of leads, customer debt portfolios, and cases.",
            icon: <FileTextOutlined className="text-2xl" />,
        },
        {
            key: "SECONDARY",
            title: "Admin Settings",
            description: "Configure team members, access permissions, and roles.",
            icon: <SettingOutlined className="text-2xl" />,
        },
    ];

    const handleSelect = (key: string) => {
        onSelectModule(key);
        onClose();
    };

    return (
        <DynamicModal
            isOpen={isOpen}
            onClose={onClose}
            className="w-[700px] h-auto relative"
            hideCloseButton={true}
            headerClassName="hidden"
            bodyClassName="p-8 relative"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary hover:bg-secondary rounded-full transition-colors z-10 cursor-pointer"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                </svg>
            </button>

            <div className="flex flex-col items-center">
                <h2 className="text-[16px] font-bold text-text-primary mb-[2px]">Switch Between the Different Modules</h2>
                <p className="text-text-secondary text-[14px] mb-8">Select and switch between them to dive deeper</p>

                <div className="flex flex-wrap gap-4 w-full overflow-auto">
                    {modules.map((mod) => {
                        const isActive = currentModule === mod.key;
                        return (
                            <div
                                key={mod.key}
                                onClick={() => handleSelect(mod.key)}
                                className={classNames(
                                    "flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group hover:shadow-md w-[300px] min-w-[300px]",
                                    isActive
                                        ? "border-primary bg-primary/10 shadow-sm"
                                        : "border-border bg-background hover:border-primary/40 hover:bg-secondary/40"
                                )}
                            >
                                <div className={classNames(
                                    "flex items-center justify-center w-12 h-12 rounded-lg shrink-0 transition-colors",
                                    isActive
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-secondary text-text-secondary group-hover:bg-primary/15 group-hover:text-primary"
                                )}>
                                    {mod.icon}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-[14px] font-bold text-text-primary mb-1">{mod.title}</h3>
                                    <p className="text-[12px] text-text-secondary leading-snug">{mod.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DynamicModal>
    );
};

export default ModuleSwitcherModal;
