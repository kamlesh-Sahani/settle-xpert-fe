"use client";

import React from "react";
import DynamicTable from "@/common/dynamic/DynamicTable/DynamicTable";

interface LogsProps {
  refreshTrigger?: number;
}

export const Logs: React.FC<LogsProps> = ({ refreshTrigger }) => {
  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-hidden">
      <DynamicTable
        filterKey="admin-meta-integration-logs"
        refreshTrigger={refreshTrigger}
        paginationType="offset"
        apiData={{
          apiUrl: "/api/v1/integration/meta/list",
          apiType: "post",
        }}
      />
    </div>
  );
};

export default Logs;
