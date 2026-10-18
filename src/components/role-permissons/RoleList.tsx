"use client";

import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import DynamicTable from "@/common/dynamic/DynamicTable/DynamicTable";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import ButtonField from "@/common/basic/ButtonField";

interface RoleListProps {
    module: "super" | "admin";
}

const RoleList: React.FC<RoleListProps> = ({ module }) => {
    const router = useRouter();
    // Unique filterKey per module to keep table settings isolated
    const filterKey = `${module}-roles`;
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const rightSection = (
        <ButtonField
            type="primary"
            icon={<PlusOutlined />}
            className="bg-primary hover:bg-primary-hover font-medium px-4"
            onClick={() => router.push(`/${module}/role/detail`)}
        >
            Create Role
        </ButtonField>
    );

    const onActionClick = (data: any) => {
        if (data?.actionType === "EDIT" || data?.actionType === "EDIT_ROLE") {
            const roleId = data?.actionData?.id;
            if (roleId) {
                router.push(`/${module}/role/detail?role=${roleId}`);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <DynamicHeader
                title="Roles Management"
                filterKey={filterKey}
                searchPlaceholder="Search roles here"
                rightSection={rightSection}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />

            {/* Dynamic Table Area */}
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
                <DynamicTable
                    filterKey={filterKey}
                    refreshTrigger={refreshTrigger}
                    onActionClick={onActionClick}
                    apiData={{
                        // You can adjust the API endpoint if admin/super fetch different roles
                        apiUrl: "/api/v1/role",
                        apiType: "get"
                    }}
                />
            </div>
        </div>
    );
};

export default RoleList;
