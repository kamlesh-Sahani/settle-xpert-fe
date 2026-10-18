"use client";
import React, { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import {
  IdcardOutlined,
  AppstoreOutlined,
  ControlOutlined,
  UserOutlined,
  LineChartOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
  CheckSquareOutlined,
  MessageOutlined,
  DollarCircleOutlined
} from "@ant-design/icons";

import DynamicSideBar from "@/common/dynamic/DynamicSideBar";
import ButtonField from "@/common/basic/ButtonField";
import InputField from "@/common/form/InputField";
import SwitchField from "@/common/form/SwitchField";
import TextAreaField from "@/common/form/TextAreaField";

import { useFetch } from "@/hooks/useFetch";
import api from "@/common/utils/api";

const RolePermission = ({ module }: { module: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleId = searchParams.get('role') || '';
  const selectedMenu = searchParams.get('selectedMenurole') || 'detail';

  const methods = useForm({
    defaultValues: {
      roleTitle: '',
      roleDescription: '',
      status: true,
      permissions: {}
    }
  });

  const { data: _data, loading: _loading, refetch: _refetch } = useFetch({
    client: api.get,
    url: '/api/v1/role-permission',
    dontCall: !module,
    options: {
      params: {
        module,
        roleId
      }
    }
  });

  const dat = [
    {
      title: "Common",
      permission: [
        { title: "Admin Role Tab View", key: "admin_role_tab_view", description: "Allow viewing admin role tab" },
        { title: "Admin Tab View", key: "admin_tab_view", description: "Allow viewing admin tab" },
        { title: "Admin White List Field", key: "admin_whitelist_field", description: "Allow admin whitelist" },
        { title: "Dashboard View", key: "dashboard_view", description: "Allow dashboard view" },
        { title: "Hide Export tab", key: "hide_export_tab", description: "Hide export tab from users" }
      ]
    },
    {
      title: "Company",
      permission: [
        { title: "Create", key: "create", description: "Allow users to create new companies." },
        { title: "Read", key: "read", description: "Allow users to view company details." },
        { title: "Update", key: "update", description: "Allow users to edit company information." },
        { title: "Delete", key: "delete", description: "Allow users to remove companies." }
      ]
    }
  ];

  const menus = useMemo(() => [
    {
      key: 'detail',
      label: 'Detail',
      icon: <IdcardOutlined />
    },
    {
      key: 'modules',
      label: 'Modules',
      icon: <AppstoreOutlined />,
      children: [
        { key: 'Common', label: 'Common', icon: <ControlOutlined /> },
        { key: 'Employee', label: 'Employee', icon: <UserOutlined /> },
        { key: 'Track', label: 'Track', icon: <LineChartOutlined /> },
        { key: 'Leave', label: 'Leave', icon: <CalendarOutlined /> },
        { key: 'Document', label: 'Document', icon: <FileTextOutlined /> },
        { key: 'Company', label: 'Company', icon: <UsergroupAddOutlined /> },
        { key: 'Task', label: 'Task', icon: <CheckSquareOutlined /> },
        { key: 'Chat', label: 'Chat', icon: <MessageOutlined /> },
        { key: 'Expense', label: 'Expense', icon: <DollarCircleOutlined /> },
      ]
    }
  ], []);

  const selectedModuleData = useMemo(() => {
    return dat.find((d) => d?.title === selectedMenu);
  }, [selectedMenu]);

  const onSubmit = (_formData: any) => {

    // Submit logic goes here
  };

  return (
    <div className="flex h-full bg-background relative border border-border rounded-xl overflow-hidden">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full w-full">
          <div className="w-[260px] shrink-0 border-r border-border bg-white flex flex-col z-10">
            <DynamicSideBar
              items={menus}
              onlySidebar={true}
              prefix="role"
              defaultOpenKeys={['modules']}
              defaultSelectedKeys={['detail']}
            />
          </div>
          <div className="flex flex-col flex-1 bg-slate-50 relative overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {selectedMenu === 'detail' ? (
                <div className="flex flex-col gap-10 max-w-4xl mx-auto mt-8 px-8 pb-12">
                  <div className="flex flex-col gap-2 border-b border-border pb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">Role Details</h1>
                    <p className="text-gray-500 text-base m-0">Define the core identity and status of this role.</p>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Role Name <span className="text-red-500">*</span></label>
                      <InputField
                        id="roleTitle"
                        name="roleTitle"
                        control={methods.control as any}
                        placeholder="e.g. Senior Software Engineer"
                        className="mb-0"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
                      <TextAreaField
                        id="roleDescription"
                        name="roleDescription"
                        control={methods.control as any}
                        placeholder="Describe the responsibilities and scope of this role..."
                        rows={4}
                        className="mb-0"
                      />
                    </div>
                    <div className="flex flex-col gap-3 pt-4">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status</label>
                      <div className="flex items-center justify-between p-6 border border-border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-1">
                          <span className="text-[15px] font-bold text-gray-900">Active Role</span>
                          <span className="text-[13px] font-medium text-gray-500">When inactive, users with this role will lose their permissions.</span>
                        </div>
                        <SwitchField id="status" name="status" control={methods.control as any} className="mb-0" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <div className="mb-8 flex items-center border-l-4 border-primary pl-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-2xl font-bold m-0 text-gray-900 tracking-tight">{selectedMenu} Permissions</h2>
                      <span className="text-sm font-medium text-gray-500">Configure access levels for the {selectedMenu} module.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {selectedModuleData?.permission?.map((perm: any) => (
                      <div key={perm.key} className="flex items-center justify-between p-6 rounded-2xl border border-border bg-white hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col gap-1.5 pr-6">
                          <span className="text-[16px] font-bold text-gray-900">{perm.title}</span>
                          <span className="text-[13px] font-medium text-gray-500 leading-snug">{perm.description}</span>
                        </div>
                        <div className="shrink-0">
                          <SwitchField
                            id={perm.key}
                            name={`permissions.${selectedMenu}.${perm.key}`}
                            control={methods.control as any}
                            className="mb-0"
                          />
                        </div>
                      </div>
                    ))}

                    {!selectedModuleData && (
                      <div className="text-gray-500 col-span-full font-medium">
                        No permissions defined for {selectedMenu}.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer for Save Button */}
            <div className="sticky bottom-0 left-0 right-0 p-5 bg-white border-t border-border flex justify-end gap-3 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)] shrink-0">
              <ButtonField onClick={() => router.back()} className="border-border hover:bg-secondary font-semibold rounded-xl px-6" title="Go Back">
                Cancel
              </ButtonField>
              <ButtonField htmlType="submit" type="primary" size="large" className="px-10 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
                {roleId ? "Save Changes" : "Create Role"}
              </ButtonField>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default RolePermission;
