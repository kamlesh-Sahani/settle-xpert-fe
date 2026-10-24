"use client";

import React, { useState } from "react";
import DynamicModal from "@/common/dynamic/DynamicModal";
import DynamicTable from "@/common/dynamic/DynamicTable/DynamicTable";
import { usePermission } from "@/components/auth/PermissionGuard";

export interface AuditChangesDetail {
    actionKey?: string;
    title?: string;
    modalData?: {
        apiUrl: string;
        apiType?: "get" | "post";
        payload?: any;
    };
    record?: any;
}

export interface DynamicAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    entityId: string;
    entityType?: string;
    title?: string;
    apiUrl: string;
    apiType?: "get" | "post";
    filterKey?: string;
    extraPayload?: Record<string, any>;
    permission?: string;
    // Optional controlled props for audit changes detail modal
    auditChanges?: AuditChangesDetail | null;
    onCloseAuditChanges?: () => void;
    onAuditActionClick?: (data: AuditChangesDetail) => void;
    onActionClick?: (data: any) => void;
}

export default function DynamicAuditModal({
    isOpen,
    onClose,
    entityId,
    entityType = "product",
    title = "Audit History",
    apiUrl,
    apiType = "post",
    filterKey,
    extraPayload,
    permission,
    auditChanges: controlledAuditChanges,
    onCloseAuditChanges: controlledOnCloseAuditChanges,
    onAuditActionClick: controlledOnAuditActionClick,
    onActionClick: onActionClickProp,
}: DynamicAuditModalProps) {
    const isPermitted = usePermission(permission || "");
    const [internalAuditChanges, setInternalAuditChanges] = useState<AuditChangesDetail | null>(null);

    // Permission enforcement: if permission is specified and employee lacks it, do not render
    if (permission && !isPermitted) {
        return null;
    }

    const resolvedFilterKey = filterKey || `${entityType}-audit-${entityId}`;

    const activeAuditChanges =
        controlledAuditChanges !== undefined ? controlledAuditChanges : internalAuditChanges;

    const handleActionClick = (data: any) => {
        const resolvedData: AuditChangesDetail = {
            actionKey: data?.actionKey,
            title: data?.title,
            modalData: data?.modalData,
            record: data?.record,
        };

        const callback = controlledOnAuditActionClick || onActionClickProp;
        if (callback) {
            callback(resolvedData);
        }

        if (controlledAuditChanges === undefined) {
            setInternalAuditChanges(resolvedData);
        }
    };

    const handleCloseAuditChanges = () => {
        if (controlledOnCloseAuditChanges) {
            controlledOnCloseAuditChanges();
        }
        setInternalAuditChanges(null);
    };

    const handleMainClose = () => {
        setInternalAuditChanges(null);
        if (controlledOnCloseAuditChanges) {
            controlledOnCloseAuditChanges();
        }
        onClose();
    };

    return (
        <>
            {isOpen && (
                <DynamicModal
                    isOpen={isOpen}
                    onClose={handleMainClose}
                    title={title}
                    close="text"
                    className="!w-[94vw] !max-w-6xl !h-[80vh] !max-h-[80vh] rounded-md shadow-xl !overflow-hidden bg-background flex flex-col"
                    bodyClassName="flex-1 min-h-0 p-4 !overflow-hidden flex flex-col"
                >
                    <div className="flex-1 min-h-0 w-full flex flex-col border border-border rounded-lg overflow-hidden">
                        <DynamicTable
                            bordered
                            filterKey={resolvedFilterKey}
                            onActionClick={handleActionClick}
                            apiData={{
                                apiUrl,
                                apiType,
                                body: {
                                    entityId,
                                    id: entityId,
                                    ...(entityType ? { [`${entityType}Id`]: entityId } : {}),
                                    ...extraPayload,
                                },
                            }}
                        />
                    </div>
                </DynamicModal>
            )}

            {isOpen && Boolean(activeAuditChanges?.modalData?.apiUrl) && (() => {
                const modalData = activeAuditChanges!.modalData!;
                const detailApiType = modalData.apiType || "post";

                return (
                    <DynamicModal
                        isOpen={true}
                        onClose={handleCloseAuditChanges}
                        title={
                            activeAuditChanges?.title
                                ? `Audit History Changes - ${activeAuditChanges.title}`
                                : "Audit History Changes"
                        }
                        close="text"
                        className="w-[90vw] max-w-5xl h-[75vh] max-h-[75vh] rounded-md shadow-xl overflow-hidden bg-background flex flex-col"
                        bodyClassName="flex-1 min-h-0 p-4 overflow-hidden flex flex-col"
                    >
                        <div className="flex-1 min-h-0 w-full flex flex-col border border-border rounded-lg overflow-hidden">
                            <DynamicTable
                                bordered
                                filterKey={`${resolvedFilterKey}-detail`}
                                apiData={{
                                    apiUrl: modalData.apiUrl,
                                    apiType: detailApiType,
                                    body: modalData.payload,
                                }}
                            />
                        </div>
                    </DynamicModal>
                );
            })()}
        </>
    );
}
