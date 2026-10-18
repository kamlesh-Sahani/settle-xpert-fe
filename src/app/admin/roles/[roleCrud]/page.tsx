"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { roleDetailSchema, RoleDetailFormValues } from "./schema";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import DynamicSideBar from "@/common/dynamic/DynamicSideBar";
import InputField from "@/common/form/InputField";
import TextAreaField from "@/common/form/TextAreaField";
import SwitchField from "@/common/form/SwitchField";
import ButtonField from "@/common/basic/ButtonField";
import LabelField from "@/common/form/LabelField";
import FormStatusMessage from "@/common/form/FormStatusMessage";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import { ErrorApi } from "@/common/ui/ErrorApi";
import api from "@/common/utils/api";
import { isArray, isNotEmptyArray, responseError } from "@/common/utils/main.utils";
import { useFetch } from "@/hooks/useFetch";
import type { MenuProps } from "antd";
import { Tooltip } from "antd";
import InfoIcon from "@/assets/icons/InfoIcon";
import DynamicConfirmationModal from "@/common/dynamic/DynamicConfirmationModal";
import { SubmitStatusType } from "@/common/form/FormStatusMessage";
import { IdcardOutlined, AppstoreOutlined } from "@ant-design/icons";
import DeleteIcon from "@/assets/icons/deleteIcon";
import { usePermission } from "@/components/auth/PermissionGuard";

/* ------------------------------------------------------------------ */
/*  Role Detail Tab Form Component                                    */
/* ------------------------------------------------------------------ */
interface RoleDetailTabProps {
    roleId: string;
    isEditing: boolean;
    onCancel: () => void;
    onRoleUpdated?: () => void;
}

function RoleDetailTab({ roleId, isEditing, onCancel, onRoleUpdated }: RoleDetailTabProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const methods = useForm<RoleDetailFormValues>({
        resolver: zodResolver(roleDetailSchema),
        defaultValues: {
            name: "",
            description: "",
            status: true,
        },
    });

    const { handleSubmit, reset, control, watch, formState: { isDirty } } = methods;
    const isRoleActive = watch("status");

    // Fetch role details if in edit mode
    const { data: roleRes, loading, error, refetch } = useFetch({
        client: api.get,
        url: `/api/v1/roles/get`,
        options: {
            params: { id: roleId },
        },
        dontCall: !isEditing,
    });

    useEffect(() => {
        if (isEditing && roleRes) {
            const d = (roleRes as any)?.data || roleRes;
            if (d) {
                reset({
                    name: d.name || "",
                    description: d.description || "",
                    status: typeof d.status === "string" ? d.status === "ACTIVE" : d.status !== undefined ? Boolean(d.status) : true,
                });
            }
        }
    }, [isEditing, roleRes, reset]);

    const onSubmit = async (formData: RoleDetailFormValues) => {
        setIsSaving(true);
        setSubmitStatus(null);
        try {
            if (!isEditing) {
                // Create mode: role created with 0 permissions
                const response: any = await api.post("/api/v1/roles/create", {
                    name: formData.name,
                    description: formData.description,
                    status: true,
                    permissions: [],
                });

                const payload = response?.data || response;
                const newId = payload?.data?.id || payload?.id;

                setSubmitStatus({
                    type: "success",
                    text: payload?.message || "Role created successfully Redirecting...",
                });

                if (newId) {
                    setTimeout(() => {
                        router.push(`/admin/roles/${newId}`);
                    }, 400);
                }
            } else {
                // Edit mode: update basic details
                const response: any = await api.post("/api/v1/roles/update", {
                    id: roleId,
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                });

                setSubmitStatus({
                    type: "success",
                    text: response?.data?.message || "Role details updated successfully",
                });
                refetch();
                if (onRoleUpdated) {
                    onRoleUpdated();
                }
            }
        } catch (err: any) {
            setSubmitStatus({
                type: "error",
                text: responseError(err) || `Failed to ${isEditing ? "update" : "create"} role`,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="medium" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <ErrorApi
                    title="Failed to load role"
                    message={responseError(error) || "Could not fetch role details."}
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full relative w-full">
                <div className="flex-1 bg-background overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        {/* Operational status toggle: only visible in edit mode */}
                        {isEditing && (
                            <div className="flex items-center justify-between w-[350px] py-2">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-text-primary">
                                            Role Status
                                        </span>
                                        <span
                                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                                                isRoleActive
                                                    ? "bg-success/15 text-success"
                                                    : "bg-secondary text-text-secondary"
                                            }`}
                                        >
                                            {isRoleActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <span className="text-xs text-text-secondary mt-0.5">
                                        Enable or disable this role
                                    </span>
                                </div>
                                <div className="shrink-0">
                                    <SwitchField
                                        id="status"
                                        control={control as any}
                                        className="w-max"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Role Name: 350px width */}
                        <div className="flex flex-col w-[350px]">
                            <LabelField required>Role Name</LabelField>
                            <InputField
                                id="name"
                                control={control as any}
                                placeholder="Enter role name"
                            />
                        </div>

                        {/* Description: 350px width */}
                        <div className="flex flex-col w-[350px]">
                            <LabelField>Description</LabelField>
                            <TextAreaField
                                id="description"
                                control={control as any}
                                placeholder="Enter brief description..."
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 z-20 flex items-center justify-end gap-4 px-8 py-4 border-t border-border bg-background shrink-0">
                    <div className="flex items-center gap-3">
                        <FormStatusMessage status={submitStatus} onDismiss={() => setSubmitStatus(null)} />
                        <ButtonField
                            type="default"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="min-w-[100px] rounded-lg"
                        >
                            Cancel
                        </ButtonField>
                        <ButtonField
                            type="primary"
                            htmlType="submit"
                            loading={isSaving}
                            disabled={isEditing && !isDirty}
                            className="min-w-[140px] rounded-lg shadow-sm font-semibold"
                        >
                            {isEditing ? "Update Role" : "Create Role"}
                        </ButtonField>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

/* ------------------------------------------------------------------ */
/*  Role Module Tab Form Component                                    */
/* ------------------------------------------------------------------ */
interface RoleModuleTabProps {
    roleId: string;
    module: string;
    onCancel: () => void;
}

interface ModulePermissionItem {
    id: string;
    title: string;
    description: string;
    category?: string;
    enabled: boolean;
}

function RoleModuleTab({ roleId, module, onCancel }: RoleModuleTabProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const methods = useForm<Record<string, boolean>>({
        defaultValues: {},
    });

    const { handleSubmit, reset, control, formState: { isDirty } } = methods;

    // Fetch this specific module's permissions and status
    const { data: moduleRes, loading, error, refetch } = useFetch({
        client: api.get,
        url: `/api/v1/roles/get`,
        options: {
            params: {
                id: roleId,
                module: module,
            },
        },
    });

    const moduleData = (moduleRes as any)?.data || moduleRes;
    const permissions: ModulePermissionItem[] = useMemo(() => {
        return isArray(moduleData?.permissions) ? moduleData.permissions : [];
    }, [moduleData]);

    const groupedPermissions = useMemo(() => {
        const groups: { [key: string]: ModulePermissionItem[] } = {};
        permissions.forEach((perm) => {
            const cat = perm.category || "";
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push(perm);
        });
        return groups;
    }, [permissions]);

    useEffect(() => {
        if (isNotEmptyArray(permissions)) {
            const initialValues: Record<string, boolean> = {};
            permissions.forEach((perm) => {
                initialValues[perm.id] = perm.enabled || false;
            });
            reset(initialValues);
        }
    }, [permissions, reset]);

    const onSubmit = async (formData: Record<string, boolean>) => {
        setIsSaving(true);
        setSubmitStatus(null);
        try {
            // Collect only the enabled permissions for this module
            const selectedPermissions = Object.keys(formData).filter((key) => formData[key] === true);

            const response: any = await api.post("/api/v1/roles/update", {
                id: roleId,
                module: module,
                permissions: selectedPermissions,
            });

            setSubmitStatus({
                type: "success",
                text: response?.data?.message || `${module} permissions updated successfully`,
            });
            refetch();
        } catch (err: any) {
            setSubmitStatus({
                type: "error",
                text: responseError(err) || `Failed to update ${module} permissions`,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="medium" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center p-6">
                <ErrorApi
                    title={`Failed to load ${module} permissions`}
                    message={responseError(error) || "Could not fetch permissions for this module."}
                    onRetry={() => refetch()}
                />
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full relative w-full">
                <div className="flex-1 bg-background overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="flex flex-col gap-6">
                        {/* Grouped permissions by category (e.g. Workspace, Member, Payment) */}
                        <div className="flex flex-col gap-10">
                            {Object.entries(groupedPermissions).map(([category, catPerms]) => (
                                <div key={category || "all"} className="flex flex-col gap-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-[3.5px] h-[18px] bg-primary rounded-sm shrink-0" />
                                        <h2 className="text-[17px] font-bold text-text-primary m-0 leading-tight">
                                            {category ? `${category} Permission` : `${module} Permission`}
                                        </h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-7">
                                        {catPerms.map((perm) => (
                                            <div
                                                key={perm.id}
                                                className="flex flex-col items-start gap-2.5"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[14px] font-semibold text-text-primary select-none leading-tight">
                                                        {perm.title}
                                                    </span>
                                                    {perm.description && (
                                                        <Tooltip title={perm.description} placement="top">
                                                            <InfoIcon className="text-text-secondary hover:text-primary transition-colors text-[14px] cursor-pointer shrink-0" />
                                                        </Tooltip>
                                                    )}
                                                </div>

                                                <SwitchField
                                                    id={perm.id}
                                                    control={control as any}
                                                    className="w-max"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 z-20 flex items-center justify-end gap-4 px-8 py-4 border-t border-border bg-background shrink-0">
                    <div className="flex items-center gap-3">
                        <FormStatusMessage status={submitStatus} onDismiss={() => setSubmitStatus(null)} />
                        <ButtonField
                            type="default"
                            onClick={onCancel}
                            disabled={isSaving}
                            className="min-w-[100px] rounded-lg"
                        >
                            Cancel
                        </ButtonField>
                        <ButtonField
                            type="primary"
                            htmlType="submit"
                            loading={isSaving}
                            disabled={!isDirty}
                            className="min-w-[140px] rounded-lg shadow-sm font-semibold"
                        >
                            Save Changes
                        </ButtonField>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

/* ------------------------------------------------------------------ */
/*  Main RoleCrudPage Component                                       */
/* ------------------------------------------------------------------ */
export default function RoleCrudPage() {
    const params = useParams();
    const router = useRouter();
    const roleId = params.roleCrud as string;
    const isEditing = roleId !== "create";

    const [activeTab, setActiveTab] = useState<string>("detail");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState<SubmitStatusType | null>(null);

    // Fetch role details if in edit mode (for header actions, delete modal, etc.)
    const { data: roleRes, refetch: refetchRole } = useFetch({
        client: api.get,
        url: `/api/v1/roles/get`,
        options: {
            params: { id: roleId },
        },
        dontCall: !isEditing,
    });

    const roleData = (roleRes as any)?.data || roleRes;
    const roleName = roleData?.name || "";
    const canDeleteRole = usePermission("role:delete");

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteStatus(null);
    };

    const handleDeleteRole = async () => {
        setIsDeleting(true);
        setDeleteStatus(null);
        try {
            const res: any = await api.post("/api/v1/roles/delete", { id: roleId });
            const payload = res?.data !== undefined ? res.data : res;

            if (payload?.success === true) {
                setDeleteStatus({
                    type: "success",
                    text: payload?.message || "Role deleted successfully. Redirecting...",
                });
                setTimeout(() => {
                    setIsDeleteModalOpen(false);
                    router.push("/admin/roles");
                }, 800);
            } else {
                // Do NOT close the modal on success: false - show error in FormStatusMessage
                setDeleteStatus({
                    type: "error",
                    text: payload?.message || "Failed to delete role",
                });
            }
        } catch (err: any) {
            // Do NOT close the modal on error - show error in FormStatusMessage
            setDeleteStatus({
                type: "error",
                text: responseError(err) || "Failed to delete role",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Fetch available permission modules from backend
    const { data: permRes, loading: permLoading, error: permError, refetch: refetchPerms } = useFetch({
        client: api.get,
        url: "/api/v1/roles/permissions",
    });

    const permissionGroups = useMemo(() => {
        const payload = (permRes as any)?.data || permRes;
        return isArray(payload) ? payload : [];
    }, [permRes]);

    // Build sidebar menu items: Detail + Modules
    const sidebarMenuItems: MenuProps["items"] = useMemo(() => {
        return [
            {
                key: "detail",
                label: "Detail",
                icon: <IdcardOutlined className="text-base" />,
            },
            {
                key: "modules",
                label: "Modules",
                icon: <AppstoreOutlined className="text-base" />,
                children: permissionGroups.map((group) => ({
                    key: group.module,
                    label: group.module,
                    disabled: !isEditing, // Disable each child module item during role creation
                })),
            },
        ];
    }, [permissionGroups, isEditing]);

    const handleMenuClick: MenuProps["onClick"] = (e) => {
        if (!isEditing) {
            // Strictly guard: during creation, only detail tab is allowed
            return;
        }
        if (e.key === "modules") {
            if (isNotEmptyArray(permissionGroups)) {
                setActiveTab(permissionGroups[0].module);
            }
            return;
        }
        setActiveTab(e.key);
    };

    // Ensure activeTab is always "detail" during creation mode
    useEffect(() => {
        if (!isEditing && activeTab !== "detail") {
            setActiveTab("detail");
        }
    }, [isEditing, activeTab]);

    // Refresh trigger for editing mode
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        refetchPerms();
        if (isEditing) {
            refetchRole();
        }
        setRefreshKey((prev) => prev + 1);
    };

    const subTitles = isEditing ? ["Update Role"] : ["Create Role"];
    const filterKey = "admin-role-crud";

    return (
        <div className="flex flex-col h-full bg-background">
            <DynamicHeader
                title="Role Management"
                subTitles={subTitles}
                filterKey={filterKey}
                onRefresh={isEditing ? handleRefresh : undefined}
                rightSection={
                    isEditing && canDeleteRole ? (
                        <Tooltip title="Delete Role">
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteStatus(null);
                                    setIsDeleteModalOpen(true);
                                }}
                                className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-[#fecdd3] bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] transition-colors cursor-pointer"
                            >
                                <DeleteIcon width={22} height={22} />
                            </button>
                        </Tooltip>
                    ) : null
                }
            />

            <div className="flex-1 overflow-hidden bg-background">
                {permLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner size="medium" />
                    </div>
                ) : permError ? (
                    <div className="flex items-center justify-center h-full p-6">
                        <ErrorApi
                            title="Failed to load permissions"
                            message={responseError(permError) || "Could not fetch available permissions."}
                            onRetry={() => refetchPerms()}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden h-full">
                        {/* Left Side: Compact DynamicSideBar for navigation */}
                        <div className="w-[190px] shrink-0 border-r border-border bg-sidebar-bg flex flex-col h-full select-none">
                            <div className="flex-1 overflow-y-auto">
                                <DynamicSideBar
                                    items={sidebarMenuItems}
                                    onlySidebar={true}
                                    collapsabled={false}
                                    selectedKeys={isEditing ? [activeTab] : ["detail"]}
                                    defaultOpenKeys={["modules"]}
                                    onClick={handleMenuClick}
                                    width={190}
                                    className="border-r-0 w-full"
                                />
                            </div>
                        </div>

                        {/* Right Side: Content Screen based on Selected Tab */}
                        <div className="flex-1 bg-background overflow-hidden flex flex-col">
                            {!isEditing || activeTab === "detail" ? (
                                <RoleDetailTab
                                    key={`detail-${refreshKey}`}
                                    roleId={roleId}
                                    isEditing={isEditing}
                                    onCancel={() => router.push("/admin/roles")}
                                    onRoleUpdated={refetchRole}
                                />
                            ) : (
                                <RoleModuleTab
                                    key={`${activeTab}-${refreshKey}`}
                                    roleId={roleId}
                                    module={activeTab}
                                    onCancel={() => router.push("/admin/roles")}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isEditing && (
                <DynamicConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleDeleteRole}
                    isLoading={isDeleting}
                    status={deleteStatus}
                    onDismissStatus={() => setDeleteStatus(null)}
                    title="Sure You Want to Delete This Role?"
                    message={
                        <div className="flex flex-col gap-2">
                            <p className="m-0">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-text-primary">
                                    {roleName ? `"${roleName}"` : "this role"}
                                </span>
                                ?
                            </p>
                            <p className="text-xs text-text-secondary m-0">
                                This action will permanently delete this role. Once deleted, it cannot be recovered.
                            </p>
                        </div>
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}
        </div>
    );
}
