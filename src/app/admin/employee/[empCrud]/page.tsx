"use client";
import React, { useEffect, useState } from 'react';
import DynamicHeader from '@/common/dynamic/DynamicHeader';
import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import { useFetch } from '@/hooks/useFetch';
import api from '@/common/utils/api';
import { responseError } from '@/common/utils/main.utils';
import ButtonField from "@/common/basic/ButtonField";
import FormStatusMessage, { SubmitStatusType } from "@/common/form/FormStatusMessage";
import { ErrorApi } from "@/common/ui/ErrorApi";

import { getEmployeeSchema, EmployeeSchema } from './schema';
import InputField from '@/common/form/InputField';
import SelectField from '@/common/form/SelectField';
import SelectApiField from '@/common/form/SelectApiField';
import UploadField from "@/common/form/upload/UploadField";
import LabelField from "@/common/form/LabelField";
import DateField from "@/common/form/DateField";
import CountryField from "@/common/form/CountryField";
import TextAreaField from "@/common/form/TextAreaField";
import EmployeeHeaderActions from './components/EmployeeHeaderActions';
import DynamicAuditModal from "@/common/dynamic/DynamicAuditModal";
import { usePermission } from "@/components/auth/PermissionGuard";
import DynamicConfirmationModal from "@/common/dynamic/DynamicConfirmationModal";
import { App } from "antd";

const filterKey = 'admin-employee-create';

const EmployeeCrud = () => {
    const { message } = App.useApp();
    const params = useParams();
    const router = useRouter();

    const empId = params?.empCrud as string;
    const isEditing = Boolean(empId && empId !== 'create');
    const subTitles = isEditing ? ["Update Employee"] : ["Create New Employee"];

    const [isSaving, setIsSaving] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);
    const [roleInitialValue, setRoleInitialValue] = useState<any[]>([]);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<"ACTIVE" | "SUSPENDED" | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusModalFeedback, setStatusModalFeedback] = useState<SubmitStatusType | null>(null);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const canViewAudit = usePermission("employee:audit") || usePermission("employee:read");

    const { data: fetchResponse, loading: isFetching, error, refetch } = useFetch({
        client: api.get,
        url: `/api/v1/emp/get`,
        options: {
            params: {
                id: empId
            }
        },
        dontCall: !isEditing
    });

    const empData = (fetchResponse as any)?.data;

    const methods = useForm<EmployeeSchema>({
        resolver: zodResolver(getEmployeeSchema(isEditing)) as any,
        defaultValues: {
            empId: "",
            name: "",
            email: "",
            password: "",
            roleId: "",
            status: "ACTIVE",
            logo: [],
            dob: "",
            gender: "",
            fatherName: "",
            motherName: "",
            panCard: "",
            dateOfJoining: "",
            aadharNumber: "",
            aadharFront: [],
            aadharBack: [],
            address: {
                line1: "",
                country: "",
                state: "",
                city: "",
                zip: "",
            },
        }
    });

    const { control, handleSubmit, reset, setValue, formState: { isDirty } } = methods;

    // Fetch auto-generated employee id for new employee
    const { refetch: refetchNextIden } = useFetch({
        client: api.get,
        url: "/api/v1/emp/next-iden",
        dontCall: isEditing,
        onSuccess: (res: any) => {
            if (res?.success && res?.data?.empId) {
                setValue("empId", res.data.empId, { shouldDirty: false });
            }
        },
    });

    useEffect(() => {
        if (empData && isEditing) {
            reset({
                empId: empData.empId || "",
                name: empData.name || "",
                email: empData.email || "",
                roleId: empData.roleId || "",
                status: empData.status || "ACTIVE",
                password: "",
                logo: empData.logo ? [{ uid: '-1', name: 'logo.png', status: 'done', url: empData.logo }] : [],
                dob: empData.dob || "",
                gender: empData.gender || "",
                fatherName: empData.fatherName || "",
                motherName: empData.motherName || "",
                panCard: empData.panCard || "",
                dateOfJoining: empData.dateOfJoining || "",
                aadharNumber: empData.aadharNumber || "",
                aadharFront: empData.aadharFront ? [{ uid: '-2', name: 'aadhar-front.png', status: 'done', url: empData.aadharFront }] : [],
                aadharBack: empData.aadharBack ? [{ uid: '-3', name: 'aadhar-back.png', status: 'done', url: empData.aadharBack }] : [],
                address: {
                    line1: empData.address?.line1 || "",
                    country: empData.address?.country || "",
                    state: empData.address?.state || "",
                    city: empData.address?.city || "",
                    zip: empData.address?.zip || "",
                },
            });

            if (empData.roleId) {
                setRoleInitialValue([
                    {
                        key: empData.roleId,
                        value: empData.roleName || "Selected Role",
                        link: `/admin/roles/${empData.roleId}`,
                    }
                ]);
            }
        }
    }, [empData, isEditing, reset]);

    const handleRefresh = () => {
        if (isEditing) {
            refetch();
        } else {
            refetchNextIden();
        }
    };

    const extractUrl = (fileVal: any): string => {
        if (typeof fileVal === "string") return fileVal;
        if (Array.isArray(fileVal) && fileVal.length > 0) {
            return fileVal[0]?.url || fileVal[0]?.response?.url || "";
        }
        return "";
    };

    const onSubmit = async (formData: EmployeeSchema) => {
        setSubmitStatus(null);
        setIsSaving(true);
        try {
            const payload: any = {
                empId: formData.empId || "",
                name: formData.name,
                email: formData.email,
                roleId: formData.roleId,
                status: formData.status,
                logo: extractUrl(formData.logo),
                dob: formData.dob || "",
                gender: formData.gender || "",
                fatherName: formData.fatherName || "",
                motherName: formData.motherName || "",
                panCard: formData.panCard || "",
                dateOfJoining: formData.dateOfJoining || "",
                aadharNumber: formData.aadharNumber || "",
                aadharFront: extractUrl(formData.aadharFront),
                aadharBack: extractUrl(formData.aadharBack),
                address: {
                    line1: formData.address?.line1 || "",
                    country: formData.address?.country || "",
                    state: formData.address?.state || "",
                    city: formData.address?.city || "",
                    zip: formData.address?.zip || "",
                },
            };

            const apiUrl = isEditing ? `/api/v1/emp/update` : `/api/v1/emp/create`;
            
            if (isEditing) {
                payload.id = empId;
                if (formData.password && formData.password.trim() !== "") {
                    payload.password = formData.password.trim();
                }
            } else {
                payload.password = formData.password;
            }

            const response = await api.post(apiUrl, payload);

            if (response.data?.success) {
                setSubmitStatus({ type: 'success', text: `Employee ${isEditing ? 'updated' : 'created'} successfully!` });
                setTimeout(() => {
                    router.push(`/admin/employee`);
                }, 1500);
            } else {
                setSubmitStatus({ type: 'error', text: response.data?.message || "Failed to save employee" });
            }
        } catch (error) {
            setSubmitStatus({ type: 'error', text: responseError(error) || "An unexpected error occurred" });
        } finally {
            setIsSaving(false);
        }
    };

    const currentStatus = methods.watch("status") || "ACTIVE";

    const handleStatusChange = (newStatus: "ACTIVE" | "SUSPENDED") => {
        if (!isEditing) {
            methods.setValue("status", newStatus, { shouldDirty: true });
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
            const res = await api.post("/api/v1/emp/status", {
                id: empId,
                status: pendingStatus,
            });
            if (res.data?.success) {
                methods.setValue("status", pendingStatus, { shouldDirty: false });
                message.success(
                    `Status updated to ${pendingStatus === "ACTIVE" ? "Active" : "Suspended"}`
                );
                setIsStatusModalOpen(false);
                setPendingStatus(null);
                refetch();
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

    return (
        <div className="flex flex-col h-full bg-background">
            <DynamicHeader
                title="Employees"
                subTitles={subTitles}
                filterKey={filterKey}
                onRefresh={handleRefresh}
                rightSection={
                    isEditing ? (
                        <EmployeeHeaderActions
                            currentStatus={currentStatus}
                            isStatusUpdating={isStatusUpdating}
                            canViewAudit={canViewAudit}
                            onStatusChange={handleStatusChange}
                            onAuditClick={() => setIsAuditModalOpen(true)}
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
                            title="Failed to load employee"
                            message={responseError(error) || "Could not fetch employee details."}
                            onRetry={refetch}
                        />
                    </div>
                ) : (
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col h-full relative w-full">
                            <input
                                type="text"
                                name="fake_email_prevent_autofill"
                                style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
                                tabIndex={-1}
                                aria-hidden="true"
                                autoComplete="off"
                            />
                            <input
                                type="password"
                                name="fake_password_prevent_autofill"
                                style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
                                tabIndex={-1}
                                aria-hidden="true"
                                autoComplete="new-password"
                            />

                            <div className="flex-1 overflow-auto p-6 md:p-8">
                                <div className="w-full mx-auto flex flex-col gap-8">
                                    
                                    {/* Section 1: Basic Information */}
                                    <div>
                                        <h3 className="text-base font-bold text-text-primary mb-4">Basic Information</h3>
                                        <div className="flex flex-col xl:flex-row gap-x-6 gap-y-5 items-start">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full max-w-[536px]">
                                                <div className="flex flex-col">
                                                    <LabelField tooltip="Auto-generated employee identifier">Employee ID</LabelField>
                                                    <InputField 
                                                        id="empId" 
                                                        control={control as any} 
                                                        placeholder="Auto-generating..." 
                                                        disabled={true} 
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <LabelField required>Full Name</LabelField>
                                                    <InputField 
                                                        id="name" 
                                                        control={control as any} 
                                                        placeholder="Enter full name" 
                                                    />
                                                </div>
                                                
                                                <div className="flex flex-col">
                                                    <LabelField required>Email Address</LabelField>
                                                    <InputField 
                                                        id="email" 
                                                        control={control as any} 
                                                        placeholder="Enter email address" 
                                                        type="email" 
                                                        autoComplete="off"
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <LabelField required={!isEditing}>Password</LabelField>
                                                    <InputField 
                                                        id="password" 
                                                        control={control as any} 
                                                        placeholder={isEditing ? "Leave blank to keep current" : "Enter password"} 
                                                        type="password" 
                                                        autoComplete="new-password"
                                                    />
                                                </div>

                                                <div className="flex flex-col">
                                                    <LabelField required>Role</LabelField>
                                                    <SelectApiField
                                                        id="roleId"
                                                        control={control as any}
                                                        apiUrl="/api/v1/roles/key-values"
                                                        method="POST"
                                                        initialValue={roleInitialValue}
                                                        placeholder="Select a role"
                                                        create={{
                                                            label: "Create Role",
                                                            onClick: () => router.push("/admin/roles/create?selectedMenu=role-management"),
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="w-full md:w-[256px] shrink-0 flex flex-col">
                                                <LabelField>Profile Photo</LabelField>
                                                <div className="mt-1 h-full">
                                                    <UploadField
                                                        id="logo"
                                                        control={control as any}
                                                        maxCount={1}
                                                        title="Upload Photo"
                                                        subtitle="PNG, JPG up to 5MB"
                                                        accept=".png,.jpg,.jpeg"
                                                        folder="employee/avatars"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Personal & Family Details */}
                                    <div className="border-t border-border pt-6">
                                        <h3 className="text-base font-bold text-text-primary mb-4">Personal & Family Details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full max-w-[536px]">
                                            <div className="flex flex-col">
                                                <LabelField required>Date of Birth</LabelField>
                                                <DateField
                                                    id="dob"
                                                    control={control as any}
                                                    placeholder="Select Date of Birth"
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <LabelField required>Gender</LabelField>
                                                <SelectField
                                                    id="gender"
                                                    control={control as any}
                                                    placeholder="Select Gender"
                                                    options={[
                                                        { key: 'Male', label: 'Male', value: 'Male' },
                                                        { key: 'Female', label: 'Female', value: 'Female' },
                                                        { key: 'Other', label: 'Other', value: 'Other' },
                                                    ]}
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <LabelField>Father&apos;s Name</LabelField>
                                                <InputField
                                                    id="fatherName"
                                                    control={control as any}
                                                    placeholder="Enter father's name"
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <LabelField>Mother&apos;s Name</LabelField>
                                                <InputField
                                                    id="motherName"
                                                    control={control as any}
                                                    placeholder="Enter mother's name"
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <LabelField required>Date of Joining</LabelField>
                                                <DateField
                                                    id="dateOfJoining"
                                                    control={control as any}
                                                    placeholder="Select Date of Joining"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Identity & Documents */}
                                    <div className="border-t border-border pt-6">
                                        <h3 className="text-base font-bold text-text-primary mb-4">Identity & Documents</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full max-w-[536px] mb-6">
                                            <div className="flex flex-col">
                                                <LabelField>
                                                    PAN Card <span className="text-text-secondary font-normal">(Optional)</span>
                                                </LabelField>
                                                <InputField
                                                    id="panCard"
                                                    control={control as any}
                                                    placeholder="Enter PAN card number"
                                                />
                                            </div>

                                            <div className="flex flex-col">
                                                <LabelField>
                                                    Aadhar Number <span className="text-text-secondary font-normal">(Optional)</span>
                                                </LabelField>
                                                <InputField
                                                    id="aadharNumber"
                                                    control={control as any}
                                                    placeholder="Enter Aadhar number"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-[536px]">
                                            <div className="flex flex-col">
                                                <LabelField>
                                                    Aadhar Card (Front) <span className="text-text-secondary font-normal">(Optional)</span>
                                                </LabelField>
                                                <div className="mt-1">
                                                    <UploadField
                                                        id="aadharFront"
                                                        control={control as any}
                                                        maxCount={1}
                                                        title="Upload Front Side"
                                                        subtitle="PNG, JPG or PDF up to 5MB"
                                                        accept=".png,.jpg,.jpeg,.pdf"
                                                        folder="employee/documents"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <LabelField>
                                                    Aadhar Card (Back) <span className="text-text-secondary font-normal">(Optional)</span>
                                                </LabelField>
                                                <div className="mt-1">
                                                    <UploadField
                                                        id="aadharBack"
                                                        control={control as any}
                                                        maxCount={1}
                                                        title="Upload Back Side"
                                                        subtitle="PNG, JPG or PDF up to 5MB"
                                                        accept=".png,.jpg,.jpeg,.pdf"
                                                        folder="employee/documents"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Address Details */}
                                    <div className="border-t border-border pt-6">
                                        <h3 className="text-base font-bold text-text-primary mb-4">Address</h3>
                                        <div className="w-full max-w-[536px]">
                                            <div className="flex flex-col mb-4">
                                                <LabelField required>Full Address</LabelField>
                                                <TextAreaField
                                                    id="address.line1"
                                                    name="address.line1"
                                                    control={control as any}
                                                    placeholder="Enter Complete Address"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <LabelField required tooltip="Registered country">
                                                        Country
                                                    </LabelField>
                                                    <CountryField
                                                        id="address.country"
                                                        name="address.country"
                                                        control={control as any}
                                                        placeholder="Select Your Country"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <LabelField>
                                                        State <span className="text-text-secondary font-normal">(Optional)</span>
                                                    </LabelField>
                                                    <InputField
                                                        id="address.state"
                                                        name="address.state"
                                                        control={control as any}
                                                        placeholder="Mention Your State Na..."
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <LabelField>
                                                        City <span className="text-text-secondary font-normal">(Optional)</span>
                                                    </LabelField>
                                                    <InputField
                                                        id="address.city"
                                                        name="address.city"
                                                        control={control as any}
                                                        placeholder="Mention Your City Na..."
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <LabelField>
                                                        Zipcode <span className="text-text-secondary font-normal">(Optional)</span>
                                                    </LabelField>
                                                    <InputField
                                                        id="address.zip"
                                                        name="address.zip"
                                                        control={control as any}
                                                        placeholder="Mention Area Zipcode"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Bottom Actions Bar */}
                            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-4 px-8 py-4 border-t border-border bg-background">
                                <FormStatusMessage status={submitStatus} onDismiss={() => setSubmitStatus(null)} />
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
                                    {isEditing ? "Update Details" : "Create Employee"}
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
                        pendingStatus === "SUSPENDED"
                            ? "Sure You Want to Suspend This Employee?"
                            : "Sure You Want to Activate This Employee?"
                    }
                    message={
                        <div className="flex flex-col gap-2">
                            <p className="m-0">
                                Are you sure you want to change status to{" "}
                                <span className="font-semibold text-text-primary">
                                    {pendingStatus === "SUSPENDED" ? "Suspended" : "Active"}
                                </span>
                                {methods.watch("name") ? (
                                    <>
                                        {" "}for{" "}
                                        <span className="font-semibold text-text-primary">
                                            &quot;{methods.watch("name")}&quot;
                                        </span>
                                    </>
                                ) : null}
                                ?
                            </p>
                            <p className="text-xs text-text-secondary m-0">
                                {pendingStatus === "SUSPENDED"
                                    ? "Suspended employees cannot log in and will have their active sessions revoked immediately."
                                    : "Active employees can log in and access features based on their assigned role."}
                            </p>
                        </div>
                    }
                    confirmText={pendingStatus === "SUSPENDED" ? "Suspend" : "Activate"}
                    cancelText="Cancel"
                />
            )}

            {isEditing && (
                <DynamicAuditModal
                    isOpen={isAuditModalOpen}
                    onClose={() => setIsAuditModalOpen(false)}
                    entityId={empId}
                    entityType="employee"
                    title="Audit History"
                    apiUrl="/api/v1/emp/audit-history"
                    permission={canViewAudit ? undefined : "employee:audit"}
                />
            )}
        </div>
    );
};

export default EmployeeCrud;
