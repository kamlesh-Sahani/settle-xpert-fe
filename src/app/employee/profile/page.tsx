"use client";

import React, { useEffect } from "react";
import { ColorPicker, App, Tooltip } from "antd";

import { useStore } from "@/store/useStore";
import { useThemeStore } from "@/store/theme/theme.store";
import { useEmployeeStore } from "@/store/employee.store";
import classNames from "classnames";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputField from "@/common/form/InputField";
import PasswordField from "@/common/form/PasswordField";
import SelectField from "@/common/form/SelectField";
import DateField from "@/common/form/DateField";
import CountryField from "@/common/form/CountryField";
import TextAreaField from "@/common/form/TextAreaField";
import UploadField from "@/common/form/upload/UploadField";
import LabelField from "@/common/form/LabelField";
import ButtonField from "@/common/basic/ButtonField";
import { responseError } from "@/common/utils/main.utils";
import { employeeApi } from "@/common/utils/api";

const profileSchema = z.object({
    empId: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    roleName: z.string().optional(),
    logo: z.any().optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    panCard: z.string().optional(),
    dateOfJoining: z.string().optional(),
    aadharNumber: z.string().optional(),
    aadharFront: z.any().optional(),
    aadharBack: z.any().optional(),
    address: z.object({
        line1: z.string().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
    }).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && data.newPassword.length < 6) {
        return false;
    }
    return true;
}, {
    message: "Password must be at least 6 characters",
    path: ["newPassword"]
}).refine(data => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const PREDEFINED_LIGHT_THEMES = [
    { name: 'Mint Green', sidebar: '#F0FFFB', primary: '#3AAB82' },
    { name: 'Soft Crimson', sidebar: '#fad7dd', primary: '#e62e4d' },
    { name: 'Light Blush', sidebar: '#fdebee', primary: '#e62e4d' },
    { name: 'Pure Indigo', sidebar: '#FFFFFF', primary: '#4A58EC' },
];

const PREDEFINED_DARK_THEMES = [
    { name: 'Mint Green (Dark)', sidebar: '#022a22', primary: '#3AAB82' },
    { name: 'Soft Crimson (Dark)', sidebar: '#2e0b12', primary: '#e62e4d' },
    { name: 'Light Blush (Dark)', sidebar: '#1a1012', primary: '#e62e4d' },
    { name: 'Pure Indigo (Dark)', sidebar: '#0a0b16', primary: '#4A58EC' },
];

const extractUrl = (fileVal: any): string => {
    if (typeof fileVal === "string") return fileVal;
    if (Array.isArray(fileVal) && fileVal.length > 0) {
        return fileVal[0]?.url || fileVal[0]?.response?.url || "";
    }
    return "";
};

export default function ProfilePage() {
    const { tenantSettings, setTenantSettings } = useStore();
    const { primaryColor, setPrimaryColor, sidebarColor, setSidebarColor, setTheme } = useThemeStore();
    const { employee, permissions, setEmployeeData } = useEmployeeStore();
    const { message } = App.useApp();
    const [isLoading, setIsLoading] = React.useState(false);

    const methods = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            empId: "",
            name: "",
            email: "",
            phone: "",
            roleName: "",
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
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        }
    });

    const { control, handleSubmit, reset } = methods;

    const reloadConfig = async () => {
        try {
            const res = await employeeApi.getConfig();
            if (res.data?.success && res.data?.data) {
                setEmployeeData(res.data.data);
            }
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        if (employee) {
            reset({
                empId: employee.empId || "",
                name: employee.name || "",
                email: employee.email || "",
                phone: employee.phone || "",
                roleName: employee.roleName || "",
                logo: employee.logo ? [{ uid: '-1', name: 'logo.png', status: 'done', url: employee.logo }] : [],
                dob: employee.dob || "",
                gender: employee.gender || "",
                fatherName: employee.fatherName || "",
                motherName: employee.motherName || "",
                panCard: employee.panCard || "",
                dateOfJoining: employee.dateOfJoining || "",
                aadharNumber: employee.aadharNumber || "",
                aadharFront: employee.aadharFront ? [{ uid: '-2', name: 'aadhar-front.png', status: 'done', url: employee.aadharFront }] : [],
                aadharBack: employee.aadharBack ? [{ uid: '-3', name: 'aadhar-back.png', status: 'done', url: employee.aadharBack }] : [],
                address: {
                    line1: employee.address?.line1 || "",
                    country: employee.address?.country || "",
                    state: employee.address?.state || "",
                    city: employee.address?.city || "",
                    zip: employee.address?.zip || "",
                },
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [employee, reset]);

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            const payload: any = {
                name: data.name,
                phone: data.phone || "",
                logo: extractUrl(data.logo),
                dob: data.dob || "",
                gender: data.gender || "",
                fatherName: data.fatherName || "",
                motherName: data.motherName || "",
                panCard: data.panCard || "",
                dateOfJoining: data.dateOfJoining || "",
                aadharNumber: data.aadharNumber || "",
                aadharFront: extractUrl(data.aadharFront),
                aadharBack: extractUrl(data.aadharBack),
                address: {
                    line1: data.address?.line1 || "",
                    country: data.address?.country || "",
                    state: data.address?.state || "",
                    city: data.address?.city || "",
                    zip: data.address?.zip || "",
                },
            };

            if (data.newPassword && data.newPassword.trim() !== "") {
                payload.newPassword = data.newPassword.trim();
                if (data.currentPassword) {
                    payload.currentPassword = data.currentPassword;
                }
            }

            await employeeApi.updateProfile(payload);
            message.success("Profile updated successfully");
            await reloadConfig();
        } catch (err) {
            message.error(responseError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const canUpdateName = permissions.has("profile:update_name");
    const canUpdatePhone = permissions.has("profile:update_phone");
    const canUpdatePhoto = permissions.has("profile:update_photo");
    const canUpdateDob = permissions.has("profile:update_dob");
    const canUpdateGender = permissions.has("profile:update_gender");
    const canUpdateFatherName = permissions.has("profile:update_father_name");
    const canUpdateMotherName = permissions.has("profile:update_mother_name");
    const canUpdateDateOfJoining = permissions.has("profile:update_date_of_joining");
    const canUpdatePanCard = permissions.has("profile:update_pan_card");
    const canUpdateAadharNumber = permissions.has("profile:update_aadhar_number");
    const canUpdateAadharFront = permissions.has("profile:update_aadhar_front");
    const canUpdateAadharBack = permissions.has("profile:update_aadhar_back");
    const canUpdateAddress = permissions.has("profile:update_address");
    const canUpdatePassword = permissions.has("profile:update_password");
    const canUpdateTheme = permissions.has("profile:update_theme");
    const isThemeDisabled = !canUpdateTheme;
    const canUpdateAnyProfile = canUpdateName || canUpdatePhone || canUpdatePhoto || canUpdateDob || canUpdateGender || canUpdateFatherName || canUpdateMotherName || canUpdateDateOfJoining || canUpdatePanCard || canUpdateAadharNumber || canUpdateAadharFront || canUpdateAadharBack || canUpdateAddress || canUpdatePassword;

    const renderPersonalInfo = () => (
        <div className="flex flex-col animate-in fade-in duration-300 w-full gap-8">
            {/* Section 1: Basic Information */}
            <div>
                <h3 className="text-base font-bold text-text-primary mb-4">Basic Information</h3>
                <div className="flex flex-col xl:flex-row gap-x-6 gap-y-5 items-start">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full max-w-[536px]">
                        <div className="flex flex-col">
                            <LabelField tooltip="Employee identifier">Employee ID</LabelField>
                            <InputField
                                id="empId"
                                control={control as any}
                                placeholder="Employee ID"
                                disabled={true}
                            />
                        </div>

                        <div className="flex flex-col">
                            <LabelField tooltip="Assigned role">Role / Designation</LabelField>
                            <InputField
                                id="roleName"
                                control={control as any}
                                placeholder="Role"
                                disabled={true}
                            />
                        </div>

                        <div className="flex flex-col">
                            <LabelField required>Full Name</LabelField>
                            <InputField
                                id="name"
                                control={control as any}
                                placeholder="Enter full name"
                                disabled={!canUpdateName}
                            />
                        </div>

                        <div className="flex flex-col">
                            <LabelField required>Email Address</LabelField>
                            <InputField
                                id="email"
                                control={control as any}
                                placeholder="Enter email address"
                                disabled={true}
                            />
                        </div>

                        <div className="flex flex-col">
                            <LabelField>Phone Number</LabelField>
                            <InputField
                                id="phone"
                                control={control as any}
                                placeholder="Enter phone number"
                                disabled={!canUpdatePhone}
                            />
                        </div>
                    </div>

                    {/* Photo Upload */}
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
                                disabled={!canUpdatePhoto}
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
                        <LabelField>Date of Birth</LabelField>
                        <DateField
                            id="dob"
                            control={control as any}
                            placeholder="Select Date of Birth"
                            disabled={!canUpdateDob}
                        />
                    </div>

                    <div className="flex flex-col">
                        <LabelField>Gender</LabelField>
                        <SelectField
                            id="gender"
                            control={control as any}
                            placeholder="Select Gender"
                            disabled={!canUpdateGender}
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
                            disabled={!canUpdateFatherName}
                        />
                    </div>

                    <div className="flex flex-col">
                        <LabelField>Mother&apos;s Name</LabelField>
                        <InputField
                            id="motherName"
                            control={control as any}
                            placeholder="Enter mother's name"
                            disabled={!canUpdateMotherName}
                        />
                    </div>

                    <div className="flex flex-col">
                        <LabelField>Date of Joining</LabelField>
                        <DateField
                            id="dateOfJoining"
                            control={control as any}
                            placeholder="Select Date of Joining"
                            disabled={!canUpdateDateOfJoining}
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
                            disabled={!canUpdatePanCard}
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
                            disabled={!canUpdateAadharNumber}
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
                                disabled={!canUpdateAadharFront}
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
                                disabled={!canUpdateAadharBack}
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
                        <LabelField>Full Address</LabelField>
                        <TextAreaField
                            id="address.line1"
                            name="address.line1"
                            control={control as any}
                            placeholder="Enter Complete Address"
                            rows={3}
                            disabled={!canUpdateAddress}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <LabelField tooltip="Registered country">
                                Country
                            </LabelField>
                            <CountryField
                                id="address.country"
                                name="address.country"
                                control={control as any}
                                placeholder="Select Your Country"
                                disabled={!canUpdateAddress}
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
                                disabled={!canUpdateAddress}
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
                                disabled={!canUpdateAddress}
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
                                disabled={!canUpdateAddress}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 5: Update Password */}
            <div className="border-t border-border pt-6">
                <h3 className="text-base font-bold text-text-primary mb-4">Update Password</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5 w-full max-w-[700px]">
                    <div className="flex flex-col">
                        <LabelField>Current Password</LabelField>
                        <PasswordField
                            id="currentPassword"
                            autoComplete="new-password"
                            name="currentPassword"
                            control={control as any}
                            placeholder="Enter current password"
                            disabled={!canUpdatePassword}
                        />
                    </div>
                    <div className="flex flex-col">
                        <LabelField>New Password</LabelField>
                        <PasswordField
                            id="newPassword"
                            autoComplete="new-password"
                            name="newPassword"
                            control={control as any}
                            placeholder="Create new password"
                            disabled={!canUpdatePassword}
                        />
                    </div>
                    <div className="flex flex-col">
                        <LabelField>Confirm Password</LabelField>
                        <PasswordField
                            id="confirmPassword"
                            autoComplete="new-password"
                            name="confirmPassword"
                            control={control as any}
                            placeholder="Confirm new password"
                            disabled={!canUpdatePassword}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAppearance = () => {
        const handleThemeModeChange = (targetMode: 'light' | 'dark') => {
            if (tenantSettings.mode === targetMode || isThemeDisabled) return;

            setTenantSettings({ mode: targetMode });

            if (targetMode === 'dark') {
                const firstDarkTheme = PREDEFINED_DARK_THEMES[0];
                if (firstDarkTheme) {
                    setTheme(firstDarkTheme.primary, firstDarkTheme.sidebar, firstDarkTheme.name);
                }
            } else {
                const firstLightTheme = PREDEFINED_LIGHT_THEMES[0];
                if (firstLightTheme) {
                    setTheme(firstLightTheme.primary, firstLightTheme.sidebar, firstLightTheme.name);
                }
            }
        };

        return (
            <div className="flex flex-col animate-in fade-in duration-300 w-full pt-4 gap-12 pb-10">
                {/* Theme Mode */}
                <div className="flex flex-col gap-3">
                    <div>
                        <h4 className="font-semibold text-text-primary text-base">Interface Theme</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Select or customize your dashboard appearance.</p>
                    </div>
                    <div className="flex items-center gap-6 mt-1">
                        {/* Light Mode Card */}
                        <div 
                            className={classNames("flex flex-col items-center gap-2.5 group", isThemeDisabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer")} 
                            onClick={() => handleThemeModeChange('light')}
                        >
                            <div className={classNames(
                                "w-40 h-28 rounded-xl border-2 p-1.5 transition-all duration-200 bg-white shadow-sm group-hover:shadow-md group-hover:-translate-y-1",
                                tenantSettings.mode === 'light' ? "border-primary ring-4 ring-primary/10" : "border-border"
                            )}>
                                <div className="w-full h-full rounded-lg flex flex-col overflow-hidden bg-slate-50 border border-slate-200">
                                    <div className="h-5 w-full flex items-center px-2 gap-1.5 bg-white border-b border-slate-200">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                    </div>
                                    <div className="flex-1 p-2.5 flex gap-2">
                                        <div className="w-5 h-full rounded-md bg-slate-200"></div>
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <div className="w-full h-2.5 bg-primary/20 rounded-sm"></div>
                                            <div className="w-3/4 h-2.5 bg-primary/20 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className={classNames(
                                "text-sm transition-colors",
                                tenantSettings.mode === 'light' ? "font-bold text-primary" : "font-medium text-text-secondary group-hover:text-text-primary"
                            )}>
                                Light Mode
                            </span>
                        </div>

                        {/* Dark Mode Card */}
                        <div 
                            className={classNames("flex flex-col items-center gap-2.5 group", isThemeDisabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer")} 
                            onClick={() => handleThemeModeChange('dark')}
                        >
                            <div className={classNames(
                                "w-40 h-28 rounded-xl border-2 p-1.5 transition-all duration-200 bg-slate-900 shadow-sm group-hover:shadow-md group-hover:-translate-y-1",
                                tenantSettings.mode === 'dark' ? "border-primary ring-4 ring-primary/10" : "border-slate-800"
                            )}>
                                <div className="w-full h-full rounded-lg flex flex-col overflow-hidden bg-slate-800 border border-slate-700">
                                    <div className="h-5 w-full flex items-center px-2 gap-1.5 bg-slate-900 border-b border-slate-700">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <div className="flex-1 p-2.5 flex gap-2">
                                        <div className="w-5 h-full rounded-md bg-slate-700"></div>
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <div className="w-full h-2.5 bg-primary/40 rounded-sm"></div>
                                            <div className="w-3/4 h-2.5 bg-primary/40 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className={classNames(
                                "text-sm transition-colors",
                                tenantSettings.mode === 'dark' ? "font-bold text-primary" : "font-medium text-text-secondary group-hover:text-text-primary"
                            )}>
                                Dark Mode
                            </span>
                        </div>
                    </div>
                </div>

                {/* Theme Colors */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between max-w-4xl">
                        <div>
                            <h4 className="font-semibold text-text-primary text-base">Brand & Sidebar Color</h4>
                            <p className="text-xs text-text-secondary mt-0.5">Select a predefined theme or fully customize your own.</p>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-lg border border-border">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Custom:</span>
                            <div className="w-px h-4 bg-border"></div>
                            <Tooltip title={isThemeDisabled ? "You don't have permission to update themes" : "Sidebar Color"}>
                                <ColorPicker disabled={isThemeDisabled} value={sidebarColor} onChange={(_, hex) => setSidebarColor(hex)} size="small" />
                            </Tooltip>
                            <Tooltip title={isThemeDisabled ? "You don't have permission to update themes" : "Brand Color"}>
                                <ColorPicker disabled={isThemeDisabled} value={primaryColor} onChange={(_, hex) => setPrimaryColor(hex)} size="small" />
                            </Tooltip>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-6 mt-4">
                        {/* Light Themes */}
                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Premium Light Themes</span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl">
                                {PREDEFINED_LIGHT_THEMES.map((theme, i) => {
                                    const isDisabled = tenantSettings.mode === 'dark' || isThemeDisabled;
                                    return (
                                        <Tooltip title={isDisabled ? (isThemeDisabled ? "You don't have permission to update themes" : "Switch to Light Mode to use this theme") : `Select ${theme.name}`} key={i} placement="top">
                                            <div className={classNames("flex flex-col items-center gap-3 group", isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer")} onClick={() => {
                                                if (isDisabled) return;
                                                setTheme(theme.primary, theme.sidebar, theme.name);
                                            }}>
                                                <button
                                                    type="button"
                                                    disabled={isDisabled}
                                                    className={classNames(
                                                        "flex w-full h-16 rounded-xl overflow-hidden border-2 transition-all duration-300",
                                                        (sidebarColor === theme.sidebar && primaryColor === theme.primary && !isDisabled) 
                                                            ? "border-primary ring-4 ring-primary/10 scale-105 shadow-md" 
                                                            : isDisabled ? "border-border shadow-none" : "border-border shadow-sm group-hover:shadow-md group-hover:-translate-y-1 group-hover:border-primary/50"
                                                    )}
                                                    aria-label={`Select theme ${theme.name}`}
                                                >
                                                    <div className="w-2/5 h-full border-r border-black/5" style={{ backgroundColor: theme.sidebar }}></div>
                                                    <div className="w-3/5 h-full relative" style={{ backgroundColor: theme.primary }}>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                                    </div>
                                                </button>
                                                <span className={classNames(
                                                    "text-xs transition-colors text-center w-full truncate px-1",
                                                    (sidebarColor === theme.sidebar && primaryColor === theme.primary && !isDisabled)
                                                        ? "font-bold text-primary" : "font-medium text-text-secondary group-hover:text-text-primary"
                                                )}>
                                                    {theme.name}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dark Themes */}
                        <div className="flex flex-col gap-3 mt-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Premium Dark Themes</span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl">
                                {PREDEFINED_DARK_THEMES.map((theme, i) => {
                                    const isDisabled = tenantSettings.mode === 'light' || isThemeDisabled;
                                    return (
                                        <Tooltip title={isDisabled ? (isThemeDisabled ? "You don't have permission to update themes" : "Switch to Dark Mode to use this theme") : `Select ${theme.name}`} key={i} placement="top">
                                            <div className={classNames("flex flex-col items-center gap-3 group", isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer")} onClick={() => {
                                                if (isDisabled) return;
                                                setTheme(theme.primary, theme.sidebar, theme.name);
                                            }}>
                                                <button
                                                    type="button"
                                                    disabled={isDisabled}
                                                    className={classNames(
                                                        "flex w-full h-16 rounded-xl overflow-hidden border-2 transition-all duration-300",
                                                        (sidebarColor === theme.sidebar && primaryColor === theme.primary && !isDisabled) 
                                                            ? "border-primary ring-4 ring-primary/10 scale-105 shadow-md" 
                                                            : isDisabled ? "border-border shadow-none" : "border-border shadow-sm group-hover:shadow-md group-hover:-translate-y-1 group-hover:border-primary/50"
                                                    )}
                                                    aria-label={`Select theme ${theme.name}`}
                                                >
                                                    <div className="w-2/5 h-full border-r border-white/10" style={{ backgroundColor: theme.sidebar }}></div>
                                                    <div className="w-3/5 h-full relative" style={{ backgroundColor: theme.primary }}>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                                    </div>
                                                </button>
                                                <span className={classNames(
                                                    "text-xs transition-colors text-center w-full truncate px-1",
                                                    (sidebarColor === theme.sidebar && primaryColor === theme.primary && !isDisabled)
                                                        ? "font-bold text-primary" : "font-medium text-text-secondary group-hover:text-text-primary"
                                                )}>
                                                    {theme.name}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            <DynamicHeader title="Profile Settings" filterKey="profile" onRefresh={reloadConfig} />

            <FormProvider {...methods}>
                <form
                    className="flex-1 overflow-hidden flex flex-col"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="flex-1 overflow-auto p-6 md:p-8">
                        <div className="flex flex-col gap-8 w-full max-w-5xl pb-8">
                            {renderPersonalInfo()}
                            
                            <div className="border-t border-border pt-6 flex flex-col w-full">
                                <h3 className="text-base font-bold text-text-primary mb-2">Appearance</h3>
                                {renderAppearance()}
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 z-10 p-4 bg-background border-t border-border flex justify-end">
                        <ButtonField
                            htmlType="submit"
                            loading={isLoading}
                            disabled={!canUpdateAnyProfile}
                            className="font-semibold px-10 bg-primary text-white hover:bg-primary-hover border-none"
                        >
                            Update Profile
                        </ButtonField>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
