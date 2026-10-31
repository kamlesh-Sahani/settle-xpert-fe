"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import DynamicTable from "@/common/dynamic/DynamicTable/DynamicTable";
import ButtonField from "@/common/basic/ButtonField";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import BulkLeadImportModal from "./components/BulkLeadImportModal";

const filterKey = "leads-list";

export default function LeadsPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const rightSection = (
    <div className="flex items-center gap-2.5">
      <ButtonField
        type="default"
        icon={<UploadOutlined />}
        onClick={() => setIsImportModalOpen(true)}
        className="font-medium px-3.5 text-xs h-9 text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
      >
        Import Leads
      </ButtonField>
      <ButtonField
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => router.push("/employee/leads/create")}
        className="bg-primary text-white hover:bg-primary-hover font-medium px-4 text-xs h-9"
      >
        Add Lead
      </ButtonField>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <DynamicHeader
        title="Leads"
        filterKey={filterKey}
        searchPlaceholder="Search leads by name, phone, email, lender..."
        rightSection={rightSection}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Dynamic Table Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DynamicTable
          filterKey={filterKey}
          refreshTrigger={refreshTrigger}
          paginationType="cursor"
          apiData={{
            apiUrl: "/api/v1/lead/list",
            apiType: "post",
          }}
        />
      </div>

      {/* Bulk Lead Import Modal */}
      <BulkLeadImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}
