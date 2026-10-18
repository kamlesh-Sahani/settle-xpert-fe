"use client";

import { ChangeEvent, useState } from "react";
import { Input, Tooltip, App } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import CsvIcon from "@/common/icons/CsvIcon";
import ExcelIcon from "@/common/icons/ExcelIcon";
import { useGridFilters } from "@/hooks/useGridFilters";
import ButtonField from "../basic/ButtonField";
import dynamic from "next/dynamic";
import { isFunction, isNotEmptyArray } from "@/common/utils/main.utils";

const FilterDrawer = dynamic(() => import("./FilterDrawer"), { ssr: false });
const ColumnDrawer = dynamic(() => import("./ColumnDrawer"), { ssr: false });
const DownloadModal = dynamic(() => import("./DownloadModal"), { ssr: false });
import classNames from "classnames";
import { IoIosArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";
import { AiFillSetting } from "react-icons/ai";
import { FaFilter } from "react-icons/fa";

export interface DynamicHeaderProps {
    filterKey: string;
    title: string;
    searchPlaceholder?: string;
    actionButton?: React.ReactNode;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
    onRefresh?: () => void;
    subTitles?: string[];
}

const DynamicHeader: React.FC<DynamicHeaderProps> = ({
    filterKey,
    title,
    searchPlaceholder = "Search here",
    actionButton: _actionButton,
    leftSection,
    rightSection,
    onRefresh,
    subTitles = []
}) => {
    const { message: _message } = App.useApp();
    const router = useRouter();
    const [filters, setFilters] = useGridFilters<any>(filterKey);
    const [searchValue, setSearchValue] = useState<string>(() => filters?.tableSearch || "");
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isColumnDrawerOpen, setIsColumnDrawerOpen] = useState(false);
    const [exportModalState, setExportModalState] = useState<{ open: boolean, format: "csv" | "excel" | null }>({ open: false, format: null });

    const activeFilterCount = filters?.isFilterActive !== false && filters?.columnFilters
        ? Object.values(filters.columnFilters).filter(
            (f: any) => f?.value !== undefined && f?.value !== ""
        ).length
        : 0;

    const hiddenColumnsCount = filters?.hiddenColumns?.length || 0;

    const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const onSearch = (value: string) => {
        setFilters({ tableSearch: value });
    };

    const handleExportClick = (format: "csv" | "excel") => {
        setExportModalState({ open: true, format });
    };

    const refreshHandler = () => {
        if (onRefresh) {
            onRefresh();
        }
        if (filters?.refresh) {
            filters.refresh();
        }
    }

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
            {/* Left Side: Title & Search */}
            <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-[20px] font-bold text-text-primary m-0 leading-none flex items-center gap-3">
                        {isNotEmptyArray(subTitles) ? (
                            <>
                                <span className="flex gap-2 items-center">
                                    <span
                                        className="text-primary cursor-pointer hover:text-primary-hover transition-colors"
                                        onClick={() => router.back()}
                                    >
                                        {title}
                                    </span>
                                    <IoIosArrowForward className="text-text-secondary" size={18} />
                                    <span className="text-text-primary">{subTitles[0]}</span>
                                </span>
                            </>
                        ) : (
                            title
                        )}
                    </h1>
                    {leftSection}
                </div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-3">
                {filters?.features?.search && (
                    <div className="w-[240px]">
                        <Input.Search
                            placeholder={searchPlaceholder}
                            enterButton
                            className="bg-secondary border-border rounded-lg hover:border-primary focus:border-primary transition-colors"
                            onChange={onSearchChange}
                            onSearch={onSearch}
                            value={searchValue}
                            allowClear
                        />
                    </div>
                )}

                {rightSection}

                {/* Export buttons — driven entirely by backend features */}
                {(filters?.features?.export?.csv || filters?.features?.export?.excel) && (
                    <div className="flex items-center gap-3">
                        {filters?.features?.export?.csv && (
                            <Tooltip title="Export CSV">
                                <button
                                    type="button"
                                    className="p-0 border-none bg-transparent cursor-pointer flex items-center justify-center hover:opacity-80 active:scale-95 transition-all outline-none"
                                    onClick={() => handleExportClick("csv")}
                                >
                                    <CsvIcon className="text-primary w-[20px] h-[26px]" />
                                </button>
                            </Tooltip>
                        )}
                        {filters?.features?.export?.excel && (
                            <Tooltip title="Export Excel">
                                <button
                                    type="button"
                                    className="p-0 border-none bg-transparent cursor-pointer flex items-center justify-center hover:opacity-80 active:scale-95 transition-all outline-none"
                                    onClick={() => handleExportClick("excel")}
                                >
                                    <ExcelIcon className="text-primary w-[26px] h-[26px]" />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {/* Columns/Settings Button */}
                    {isNotEmptyArray(filters?.columns) && (
                        <Tooltip title="Settings">
                            <ButtonField
                                icon={<AiFillSetting className="text-text-primary text-[15px] flex items-center justify-center" />}
                                className={classNames("bg-secondary border-border hover:bg-secondary/80 transition-colors duration-200 rounded-lg h-[34px] w-[40px] flex items-center justify-center p-0 shadow-sm", {
                                    "bg-primary-50 border-primary-200 text-primary-600":
                                        hiddenColumnsCount > 0,
                                })}
                                onClick={() => setIsColumnDrawerOpen(true)}
                            >
                                {hiddenColumnsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center bg-danger text-white rounded-full text-[9px] w-3.5 h-3.5 font-bold">
                                        {hiddenColumnsCount}
                                    </span>
                                )}
                            </ButtonField>
                        </Tooltip>
                    )}

                    {/* Filters Button */}
                    {(isNotEmptyArray(filters?.backendFilters) || isNotEmptyArray(filters?.columns)) && (
                        <Tooltip title="Filters">
                            <ButtonField
                                icon={<FaFilter className="text-text-primary text-[15px] flex items-center justify-center" />}
                                className={classNames("bg-secondary border-border hover:bg-secondary/80 transition-colors duration-200 rounded-lg h-[34px] w-[40px] flex items-center justify-center p-0 shadow-sm", {
                                    "bg-primary-50 border-primary-200 text-primary-600":
                                        activeFilterCount > 0,
                                })}
                                onClick={() => setIsFilterDrawerOpen(true)}
                            >
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center bg-primary text-background rounded-full text-[9px] w-3.5 h-3.5 font-bold">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </ButtonField>
                        </Tooltip>
                    )}
                    {
                        (isFunction(onRefresh) || isFunction(filters?.refresh)) && <Tooltip title="Refresh">
                            <ButtonField
                                icon={<ReloadOutlined className="text-text-primary text-lg flex items-center justify-center" />}
                                className="bg-secondary border-border hover:bg-secondary/80 transition-colors duration-200 rounded-lg h-[34px] w-[40px] flex items-center justify-center p-0 shadow-sm"
                                onClick={refreshHandler}
                                loading={filters?.tableLoading}
                            />
                        </Tooltip>
                    }

                </div>

            </div>
            {
                isFilterDrawerOpen &&
                <FilterDrawer
                    isOpen={isFilterDrawerOpen}
                    onClose={() => setIsFilterDrawerOpen(false)}
                    filterKey={filterKey}
                />
            }
            {
                isColumnDrawerOpen && <ColumnDrawer
                    isOpen={isColumnDrawerOpen}
                    onClose={() => setIsColumnDrawerOpen(false)}
                    filterKey={filterKey}
                />
            }
            {exportModalState.open && (
                <DownloadModal
                    open={exportModalState.open}
                    onClose={() => setExportModalState({ ...exportModalState, open: false })}
                    format={exportModalState.format}
                    filterKey={filterKey}
                />
            )}
        </div>
    );
};

export default DynamicHeader;