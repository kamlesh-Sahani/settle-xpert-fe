"use client";

import { useState } from "react";
import DynamicHeader from "@/common/dynamic/DynamicHeader";
import DynamicTable from "@/common/dynamic/DynamicTable/DynamicTable";

const filterKey = "customers-list";

export default function CustomersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <DynamicHeader
        title="Customers"
        filterKey={filterKey}
        searchPlaceholder="Search customers by name, phone, email, CUST #..."
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <DynamicTable
          filterKey={filterKey}
          refreshTrigger={refreshTrigger}
          paginationType="cursor"
          apiData={{
            apiUrl: "/api/v1/customer/list",
            apiType: "post",
          }}
        />
      </div>
    </div>
  );
}
