"use client";

import React, { useEffect, useState } from "react";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import { useParams, useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import { useFetch } from "@/hooks/useFetch";
import { api, responseError } from "@/common/utils";
import ButtonField from "@/common/basic/ButtonField";
import FormStatusMessage, { SubmitStatusType } from "@/common/form/FormStatusMessage";
import { ErrorApi } from "@/common/ui/ErrorApi";
import InputField from "@/common/form/InputField";
import TextAreaField from "@/common/form/TextAreaField";
import LabelField from "@/common/form/LabelField";
import DepartmentHeaderActions from "./components/DepartmentHeaderActions";
import DynamicAuditModal from "@/common/dynamic/DynamicAuditModal";
import { usePermission } from "@/components/auth/PermissionGuard";
import DynamicConfirmationModal from "@/common/dynamic/DynamicConfirmationModal";
import { App } from "antd";

import { departmentSchema, DepartmentSchema } from "./schema";

const filterKey = "admin-departments-create";

export default function DepartmentCrudPage() {
    const { message } = App.useApp();
    const params = useParams();
    const router = useRouter();

    const deptId = params?.deptCrud as string;
    const isEditing = Boolean(deptId && deptId !== "create");
    const subTitles = isEditing ? ["Update Department"] : ["Create New Department"];

    const [isSaving, setIsSaving] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<"ACTIVE" | "IN_ACTIVE" | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalFeedback, setStatusModalFeedback] = useState<SubmitStatusType | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

    const canViewAudit = usePermission("department:read");
    const canDelete = usePermission("department:delete");
    const canCreate = usePermission("department:create");
    const canUpdate = usePermission("department:update");

    const methods = useForm<DepartmentSchema>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            status: "ACTIVE",
        },
    });

    const { control, handleSubmit, reset, setValue, watch, formState: { isDirty } } = methods;

    const { data: fetchResponse, loading: isFetching, error, refetch } = useFetch({
        client: api.get,
        url: "/api/v1/departments/get",
        options: {
            params: {
                id: deptId,
            },
        },
        dontCall: !isEditing,
        onSuccess: (res: any) => {
            if (res?.data) {
                const d = res.data;
                reset({
                    name: d.name || "",
                    code: d.code || "",
                    description: d.description || "",
                    status: d.status || "ACTIVE",
                });
            }
        },
    });

    const handleRefresh = () => {
        if (isEditing) {
            refetch();
        }
    };

    const onSubmit = async (formData: DepartmentSchema) => {
        setSubmitStatus(null);
        setIsSaving(true);
        try {
            const payload: any = {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                description: formData.description?.trim() || "",
                status: formData.status,
            };

            const apiUrl = isEditing ? "/api/v1/departments/update" : "/api/v1/departments/create";
            if (isEditing) {
                payload.id = deptId;
            }

            const response = await api.post(apiUrl, payload);

            if (response.data?.success) {
                setSubmitStatus({
                    type: "success",
                    text: `Department ${isEditing ? "updated" : "created"} successfully!`,
                });
                message.success(`Department ${isEditing ? "updated" : "created"} successfully`);
                setTimeout(() => {
                    router.push("/admin/departments");
                }, 800);
            } else {
                setSubmitStatus({
                    type: "error",
                    text: response.data?.message || "Failed to save department",
                });
            }
        } catch (error: any) {
            setSubmitStatus({
                type: "error",
                text: responseError(error) || "An unexpected error occurred",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const currentStatus = watch("status") || "ACTIVE";

    const handleStatusChange = (newStatus: "ACTIVE" | "IN_ACTIVE") => {
        if (!isEditing) {
            setValue("status", newStatus, { shouldDirty: true });
            return;
        }
        if (newStatus === currentStatus) return;

        setPendingStatus(newStatus);
        setStatusModalFeedback(null);
        setIsStatusModalOpen(true);
    };

    const handleCloseStatusModal = () => {
        if (isStatusUpdating) return;
        setIsStatusModalOpen(false);
        setPendingStatus(null);
        setStatusModalFeedback(null);
    };

    const handleConfirmStatusChange = async () => {
        if (!pendingStatus || !isEditing) return;

        setIsStatusUpdating(true);
        setStatusModalFeedback(null);
        try {
            const res = await api.post("/api/v1/departments/status", {
                id: deptId,
                status: pendingStatus,
            });

            if (res.data?.success) {
                setValue("status", pendingStatus);
                message.success(res.data?.message || "Status updated successfully");
                handleCloseStatusModal();
            } else {
                setStatusModalFeedback({
                    type: "error",
                    text: res.data?.message || "Failed to update status",
                });
            }
        } catch (err: any) {
            setStatusModalFeedback({
                type: "error",
                text: responseError(err) || "Failed to update status",
            });
        } finally {
            setIsStatusUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res: any = await api.post("/api/v1/departments/delete", { id: deptId });
            if (res?.data?.success) {
                message.success("Department deleted successfully");
                setIsDeleteModalOpen(false);
                router.push("/admin/departments");
            } else {
                message.error(res?.data?.message || "Failed to delete department");
            }
        } catch (err: any) {
            message.error(responseError(err));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <DynamicHeader
                title="Departments"
                subTitles={subTitles}
                filterKey={filterKey}
                onRefresh={handleRefresh}
                rightSection={
                    isEditing ? (
                        <DepartmentHeaderActions
                            currentStatus={currentStatus}
                            isStatusUpdating={isStatusUpdating}
                            canViewAudit={canViewAudit}
                            canDelete={canDelete}
                            onStatusChange={handleStatusChange}
                            onAuditClick={() => setIsAuditModalOpen(true)}
                            onDeleteClick={() => setIsDeleteModalOpen(true)}
                        />
                    ) : null
                }
            />

            <div className="flex-1 overflow-hidden bg-background">
                {isFetching ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <ErrorApi
                            title="Failed to load department"
                            message={responseError(error) || "Could not fetch department details."}
                            onRetry={refetch}
                        />
                    </div>
                ) : (
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col h-full relative w-full">
                            <div className="flex-1 overflow-auto p-6 md:p-8">
                                <div className="w-full mx-auto flex flex-col gap-8">
                                    <div className="flex flex-col xl:flex-row gap-x-6 gap-y-5 items-start">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full max-w-[536px]">
                                            <div className="flex flex-col">
                                                <LabelField required>Department Name</LabelField>
                                                <InputField 
                                                    id="name" 
                                                    control={control as any} 
                                                    placeholder="e.g. Sales, Operations, Finance" 
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <LabelField required tooltip="Unique uppercase code for this department">
                                                    Department Code
                                                </LabelField>
                                                <InputField 
                                                    id="code" 
                                                    control={control as any} 
                                                    placeholder="e.g. SALES, OPS, FIN" 
                                                    className="uppercase"
                                                />
                                            </div>

                                            <div className="flex flex-col sm:col-span-2">
                                                <LabelField tooltip="Optional summary of this department's functions">
                                                    Description
                                                </LabelField>
                                                <TextAreaField 
                                                    id="description" 
                                                    control={control as any} 
                                                    placeholder="Enter brief description of this department..." 
                                                    rows={3} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom sticky action bar */}
                            <div className="border-t border-border bg-background px-6 py-4 flex items-center justify-end gap-3 sticky bottom-0 z-10">
                                {submitStatus && (
                                    <div className="mr-auto">
                                        <FormStatusMessage status={submitStatus} className="text-sm py-1" />
                                    </div>
                                )}
                                <ButtonField
                                    type="default"
                                    onClick={() => router.back()}
                                    disabled={isSaving}
                                    className="min-w-[100px] rounded-lg"
                                >
                                    Cancel
                                </ButtonField>
                                <ButtonField
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSaving}
                                    disabled={!isDirty && isEditing}
                                    className="min-w-[150px] rounded-lg shadow-sm"
                                >
                                    {isEditing ? "Update Details" : "Create Department"}
                                </ButtonField>
                            </div>
                        </form>
                    </FormProvider>
                )}
            </div>

            {isEditing && (
                <DynamicConfirmationModal
                    isOpen={isStatusModalOpen}
                    onClose={handleCloseStatusModal}
                    onConfirm={handleConfirmStatusChange}
                    isLoading={isStatusUpdating}
                    status={statusModalFeedback}
                    onDismissStatus={() => setStatusModalFeedback(null)}
                    title={
                        pendingStatus === "IN_ACTIVE"
                            ? "Sure You Want to Deactivate This Department?"
                            : "Sure You Want to Activate This Department?"
                    }
                    message={
                        <div className="flex flex-col gap-2">
                            <p className="m-0">
                                Are you sure you want to change status to{" "}
                                <span className="font-semibold text-text-primary">
                                    {pendingStatus === "IN_ACTIVE" ? "Inactive" : "Active"}
                                </span>
                                {watch("name") ? (
                                    <>
                                        {" "}for{" "}
                                        <span className="font-semibold text-text-primary">
                                            &quot;{watch("name")}&quot;
                                        </span>
                                    </>
                                ) : null}
                                ?
                            </p>
                            <p className="text-xs text-text-secondary m-0">
                                {pendingStatus === "IN_ACTIVE"
                                    ? "Inactive departments cannot be assigned to new employees."
                                    : "Active departments are available to be assigned across employees and filters."}
                            </p>
                        </div>
                    }
                    confirmText={pendingStatus === "IN_ACTIVE" ? "Deactivate" : "Activate"}
                    cancelText="Cancel"
                />
            )}

            {isEditing && (
                <DynamicConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                    title="Delete Department"
                    message={
                        <div className="flex flex-col gap-2">
                            <p className="m-0">
                                Are you sure you want to delete department{" "}
                                <span className="font-semibold text-text-primary">
                                    &quot;{watch("name")}&quot;
                                </span>
                                ?
                            </p>
                            <p className="text-xs text-text-secondary m-0">
                                This action cannot be undone if employees are attached to this department.
                            </p>
                        </div>
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}

            {isEditing && (
                <DynamicAuditModal
                    isOpen={isAuditModalOpen}
                    onClose={() => setIsAuditModalOpen(false)}
                    entityId={deptId}
                    entityType="department"
                    title="Audit History"
                    apiUrl="/api/v1/departments/audit-history"
                    permission={canViewAudit ? undefined : "department:read"}
                />
            )}
        </div>
    );
}
