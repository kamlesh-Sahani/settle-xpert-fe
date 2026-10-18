"use client";

import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import DynamicTable from "@/common/dynamic/DynamicTable/DynamicTable";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import ButtonField from "@/common/basic/ButtonField";
import DynamicAuditModal from "@/common/dynamic/DynamicAuditModal";
import { useRouter, useSearchParams } from "next/navigation";

export default function TeamPage() {
    const filterKey = "admin-team";
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleCreate = () => {
        router.push(`/admin/team/create?${searchParams.toString()}`);
    };

    const rightSection = (
        <ButtonField
            type="primary"
            icon={<PlusOutlined />}
            className="bg-primary text-white hover:bg-primary-hover font-medium px-4 rounded-[8px]"
            onClick={handleCreate}
        >
            Add Team Member
        </ButtonField>
    );

    const onActionClick = (data: any) => {
        if (data?.actionType === "AUDIT") {
            const id = data?.actionData?.id || data?.record?.id || data?.id;
            if (id) {
                setSelectedAuditId(id);
                return;
            }
        }
        if (data?.actionType === "CREATE_MEMBER" || data?.actionType === "EDIT") {
            const id = data?.actionData?.id;
            if (id) {
                router.push(`/admin/team/${id}?${searchParams.toString()}`);
            } else {
                handleCreate();
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-background w-full">
            <DynamicHeader
                title="Team"
                filterKey={filterKey}
                searchPlaceholder="Search team members here"
                rightSection={rightSection}
                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />

            {/* Dynamic Table Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <DynamicTable
                    filterKey={filterKey}
                    refreshTrigger={refreshTrigger}
                    onActionClick={onActionClick}
                    paginationType="cursor"
                    apiData={{
                        apiUrl: "/api/v1/team/list",
                        apiType: "post"
                    }}
                />
            </div>

            <DynamicAuditModal
                isOpen={Boolean(selectedAuditId)}
                onClose={() => setSelectedAuditId(null)}
                entityId={selectedAuditId || ""}
                entityType="team"
                title="Audit History"
                apiUrl="/api/v1/team/audit-history"
            />
        </div>
    );
}
