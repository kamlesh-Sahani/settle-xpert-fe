"use client";

import { useEffect, useState } from "react";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import { useParams, useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import { useFetch } from "@/hooks/useFetch";
import api from "@/common/utils/api";
import { responseError } from "@/common/utils/main.utils";
import ButtonField from "@/common/basic/ButtonField";
import FormStatusMessage, { SubmitStatusType } from "@/common/form/FormStatusMessage";
import { ErrorApi } from "@/common/ui/ErrorApi";

import {
  LeadSchema,
  useLeadForm,
  buildLeadPayload,
  mapLeadDataToForm,
  DebtItem,
} from "./lead.utils";
import { useEmployeeStore } from "@/store/employee.store";
import { Tag, Tabs } from "antd";
import LeadConversation from "./components/LeadConversation";
import LeadDetails from "./components/LeadDetails";

const filterKey = "lead-crud";

export default function LeadCrudPage() {
  const params = useParams();
  const router = useRouter();

  const leadId = params?.leadCrud as string;
  const isEditing = Boolean(leadId && leadId !== "create");
  const subTitles = isEditing ? ["Update Lead"] : ["Create New Lead"];

  // 2-tab state: 'details' (Lead Details) or 'communications' (Live Calling & WhatsApp)
  const [activeTab, setActiveTab] = useState<string>("details");

  const [isSaving, setIsSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatusType | null>(null);

  // Dynamic loan items state
  const [debts, setDebts] = useState<DebtItem[]>([]);

  const permissions = useEmployeeStore((state) => state.permissions);
  const canAssign = permissions.has("lead:assign") || permissions.has("admin");

  const { data: fetchResponse, loading: isFetching, error, refetch } = useFetch({
    client: api.get,
    url: `/api/v1/lead/get?id=${leadId}`,
    dontCall: !isEditing,
  });

  const leadData = (fetchResponse as any)?.data;

  const methods = useLeadForm();

  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;

  // Hydrate form in edit mode
  useEffect(() => {
    if (leadData && isEditing) {
      const fetchedDebts = (leadData.financialAssessment?.debts || []).map((d: any) => ({
        lender: d.lender,
        loanType: d.loanType,
        outstandingAmount: d.outstandingAmount,
        monthlyEmi: d.monthlyEmi,
      }));
      setDebts(fetchedDebts);
      reset(mapLeadDataToForm(leadData, fetchedDebts));
    }
  }, [leadData, isEditing, reset]);

  const onSubmit = async (values: LeadSchema) => {
    setIsSaving(true);
    setSubmitStatus(null);

    const payload = buildLeadPayload(values, debts);

    try {
      const res = isEditing
        ? await api.post("/api/v1/lead/update", { id: leadId, ...payload })
        : await api.post("/api/v1/lead/create", payload);

      setSubmitStatus({
        type: "success",
        text: res.data?.message,
      });

      if (!isEditing) {
        setTimeout(() => {
          router.push("/employee/leads");
        }, 700);
      } else {
        refetch();
      }
    } catch (err) {
      setSubmitStatus({
        type: "error",
        text: responseError(err),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalInteractionsCount = leadData?.conversations?.length || 0;

  const tabPanels = [
    {
      key: "details",
      component: (
        <LeadDetails
          canAssign={canAssign}
          debts={debts}
          setDebts={setDebts}
        />
      ),
    },
    {
      key: "conversation",
      component: (
        <LeadConversation
          leadName={leadData?.fullName || watch("fullName") || "Borrower"}
          phone={leadData?.phone || watch("phone") || ""}
          conversations={leadData?.conversations || []}
          isCreation={!isEditing}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <DynamicHeader
        title="Leads"
        subTitles={subTitles}
        filterKey={filterKey}
        onRefresh={isEditing ? refetch : undefined}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col flex-1 overflow-hidden relative w-full">
          {/* ── 2 Main Tabs: 1. Lead Details  2. Conversation ──── */}
          <div className="w-full bg-background shrink-0">
            <div className="w-full max-w-[560px]">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="w-full [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav::before]:border-none [&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:justify-center [&_.ant-tabs-tab]:text-center [&_.ant-tabs-tab]:m-0"
                items={[
                  {
                    key: "details",
                    label: <span className="font-semibold text-sm">Lead Details</span>,
                  },
                  {
                    key: "conversation",
                    label: (
                      <span className="font-semibold text-sm inline-flex items-center justify-center gap-1.5">
                        Conversation
                        {isEditing && totalInteractionsCount > 0 && (
                          <Tag color="blue" className="text-[10px] py-0 px-1.5 m-0 font-normal">
                            {totalInteractionsCount}
                          </Tag>
                        )}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
            {isFetching ? (
              <div className="h-full w-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="h-full w-full flex items-center justify-center">
                <ErrorApi
                  title="Failed to load lead"
                  message={responseError(error) || "Could not fetch lead details."}
                  onRetry={refetch}
                />
              </div>
            ) : (
              tabPanels.map(({ key, component }) => (
                <div key={key} className={activeTab === key ? "block" : "hidden"}>
                  {component}
                </div>
              ))
            )}
        </div>

        {/* Bottom Actions Bar: ALWAYS VISIBLE across all tabs! */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-4 px-8 py-4 border-t border-border bg-background shrink-0">
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
            {isEditing ? "Update Details" : "Create Lead"}
          </ButtonField>
        </div>
      </form>
    </FormProvider>
    </div>
  );
}