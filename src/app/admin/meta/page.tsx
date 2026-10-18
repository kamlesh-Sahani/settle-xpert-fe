"use client";

import { useState } from "react";
import { Tabs, Badge, App } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { useForm } from "react-hook-form";
import { api, responseError } from "@/common/utils";
import { useFetch } from "@/hooks/useFetch";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import ButtonField from "@/common/basic/ButtonField";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import { ErrorApi } from "@/common/ui/ErrorApi";
import { useUserStore } from "@/store/user.store";
import { usePermission } from "@/components/auth/PermissionGuard";
import { Detail, Logs, MetaConfig } from "./tab";

interface IntegrationFormData {
  callbackUrl?: string;
  verifyToken: string;
  pageAccessToken: string;
  pageId: string;
  pageName: string;
  appSecret: string;
}

export default function IntegrationsPage() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState("configuration");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState<MetaConfig | null>(null);
  const [logsRefreshTrigger, setLogsRefreshTrigger] = useState(0);

  const webhookUrl = useUserStore((state) => state.webhooks?.meta);
  const canUpdate = usePermission("meta:update");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<IntegrationFormData>({
    defaultValues: {
      callbackUrl: "",
      verifyToken: "",
      pageAccessToken: "",
      pageId: "",
      pageName: "",
      appSecret: "",
    },
  });

  const pageAccessToken = watch("pageAccessToken");
  const verifyToken = watch("verifyToken");

  const { loading, error, refetch: fetchConfig } = useFetch<any>({
    client: api.get,
    url: "/api/v1/integration/meta/get",
    onSuccess: (res: any) => {
      if (res?.success && res?.data) {
        const d: MetaConfig = res.data;
        setConfig(d);
        reset({
          callbackUrl: webhookUrl,
          verifyToken: d.verifyToken,
          pageAccessToken: d.maskedAccessToken,
          pageId: d.pageId,
          pageName: d.pageName,
          appSecret: "",
        });
      }
    },
  });

  const copyToClipboard = (text?: string, label?: string) => {
    if (text && navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      message.success(`${label} copied to clipboard!`);
    }
  };

  const generateNewToken = () => {
    const random = "meta_verify_" + Math.random().toString(36).substring(2, 10);
    setValue("verifyToken", random, { shouldDirty: true });
    message.info("Generated new verify token. Click Save to apply.");
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const res: any = await api.post("/api/v1/integration/meta/test-connection", {
        pageAccessToken: watch("pageAccessToken"),
        pageId: watch("pageId"),
      });

      if (res?.data?.success) {
        message.success(res?.data?.message);
        fetchConfig();
      } else {
        message.error(res?.data?.message);
      }
    } catch (err: any) {
      message.error(responseError(err));
    } finally {
      setTesting(false);
    }
  };

  const onSaveSubmit = async (formData: IntegrationFormData) => {
    try {
      setSaving(true);
      const payload = {
        isActive: true,
        verifyToken: formData.verifyToken,
        pageAccessToken: formData.pageAccessToken,
        pageId: formData.pageId,
        pageName: formData.pageName,
        appSecret: formData.appSecret,
        fieldMapping: config?.fieldMapping,
      };

      const res: any = await api.post("/api/v1/integration/meta/save", payload);
      if (res?.data?.success) {
        message.success(res?.data?.message);
        fetchConfig();
      } else {
        message.error(res?.data?.message);
      }
    } catch (err: any) {
      message.error(responseError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full py-20">
        <ErrorApi
          title="Failed to load Meta configuration"
          message={error}
          onRetry={fetchConfig}
        />
      </div>
    );
  }

  const isConnected = Boolean(config?.hasAccessToken);

  const leftSection = (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <Badge
          status="processing"
          text={<span className="text-xs font-semibold text-emerald-600">Active</span>}
        />
      ) : (
        <Badge
          status="default"
          text={<span className="text-xs text-text-secondary">Not Connected</span>}
        />
      )}
    </div>
  );

  const rightSection = canUpdate ? (
    <div className="flex items-center gap-2">
      <ButtonField
        icon={<ThunderboltOutlined />}
        loading={testing}
        onClick={handleTestConnection}
        className="rounded-[8px]"
      >
        Test Connection
      </ButtonField>
      <ButtonField
        type="primary"
        loading={saving}
        disabled={!isDirty || saving}
        onClick={handleSubmit(onSaveSubmit)}
        className="bg-primary text-white hover:bg-primary-hover font-medium rounded-[8px] disabled:opacity-20 disabled:cursor-not-allowed"
      >
        Save Changes
      </ButtonField>
    </div>
  ) : undefined;

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <DynamicHeader
        title="Meta"
        filterKey={activeTab === "logs" ? "admin-meta-integration-logs" : "admin-meta-integration"}
        searchPlaceholder="Search logs by lead, name, phone, email..."
        leftSection={activeTab === "configuration" ? leftSection : undefined}
        rightSection={activeTab === "configuration" ? rightSection : undefined}
        onRefresh={() => {
          if (activeTab === "configuration") {
            fetchConfig();
          } else {
            setLogsRefreshTrigger((prev) => prev + 1);
          }
        }}
      />

      {/* Static Tabs Navigation Header */}
      <div className="px-6 md:px-8 bg-background shrink-0">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="custom-integration-tabs [&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-nav::before]:!border-none"
          items={[
            {
              key: "configuration",
              label: (
                <div className="w-40 text-center font-medium">
                  Configuration
                </div>
              ),
            },
            {
              key: "logs",
              label: (
                <div className="w-40 text-center font-medium">
                  Logs
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Tab Panes */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {activeTab === "configuration" && (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
            <Detail
              control={control}
              setValue={setValue}
              callbackUrl={webhookUrl}
              verifyToken={verifyToken}
              copyToClipboard={copyToClipboard}
              generateNewToken={generateNewToken}
            />
          </div>
        )}
        {activeTab === "logs" && (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <Logs refreshTrigger={logsRefreshTrigger} />
          </div>
        )}
      </div>
    </div>
  );
}
