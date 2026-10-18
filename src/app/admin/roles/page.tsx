"use client";

import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import DynamicTable from "@/common/dynamic/DynamicTable/DynamicTable";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import ButtonField from "@/common/basic/ButtonField";
import { useRouter, useSearchParams } from "next/navigation";

export default function RolesPage() {
    const filterKey = "admin-roles";
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleCreate = () => {
        router.push(`/admin/roles/create?${searchParams.toString()}`);
    };

    const rightSection = (
        <ButtonField
            type="primary"
            icon={<PlusOutlined />}
            className="bg-primary text-white hover:bg-primary-hover font-medium px-4 rounded-[8px]"
            onClick={handleCreate}
        >
            Add Role
        </ButtonField>
    );

    const onActionClick = (data: any) => {
        if (data?.actionType === "CREATE_ROLE" || data?.actionType === "EDIT") {
            const id = data?.actionData?.id;
            if (id) {
                router.push(`/admin/roles/${id}?${searchParams.toString()}`);
            } else {
                handleCreate();
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-background w-full">
            <DynamicHeader
                title="Roles & Permissions"
                filterKey={filterKey}
                searchPlaceholder="Search roles here"
                rightSection={rightSection}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />

            {/* Dynamic Table Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <DynamicTable
                    filterKey={filterKey}
                    refreshTrigger={refreshTrigger}
                    onActionClick={onActionClick}
                    apiData={{
                        apiUrl: "/api/v1/roles/list",
                        apiType: "post"
                    }}
                />
            </div>
        </div>
    );
}
