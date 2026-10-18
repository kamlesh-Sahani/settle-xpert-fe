"use client";

import React, { useEffect, useState } from "react";
import { Form, Select } from "antd";
import LoadingSpinner from "@/common/basic/LoadingSpinner";
import type { SelectProps } from "antd";

import type { Rule } from "antd/es/form";
import api from "@/common/utils/api";
import { isArray } from "@/common/utils/main.utils";

export interface AutocompleteSelectProps extends SelectProps {
  name: string | (string | number)[];
  label?: React.ReactNode;
  rules?: Rule[];
  apiUrl: string; // The endpoint to fetch data from
  searchParam?: string; // e.g. "q" or "search"
  labelPath?: string; // Path in the response array to use as label (e.g. "name")
  valuePath?: string; // Path in the response array to use as value (e.g. "id")
  help?: React.ReactNode;
}

export default function AutocompleteSelect({
  name,
  label,
  rules,
  apiUrl,
  searchParam = "search",
  labelPath = "name",
  valuePath = "id",
  help,
  ...props
}: AutocompleteSelectProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async (searchText: string = "") => {
    setLoading(true);
    try {
      const params = { [searchParam]: searchText, limit: 20 };
      const response: any = await api.get(apiUrl, { params });
      
      // Auto-resolve array path if response is nested under "data" or "items"
      const items = isArray(response) ? response : (response.data || response.items || []);
      
      const options = items.map((item: any) => ({
        label: labelPath.split(".").reduce((acc, part) => acc && acc[part], item) || item.name,
        value: valuePath.split(".").reduce((acc, part) => acc && acc[part], item) || item.id,
      }));
      
      setData(options);
    } catch (error) {
      console.error("Failed to fetch autocomplete options", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions(""); // Initial fetch on mount
  }, [apiUrl]);

  return (
    <Form.Item name={name} label={label} rules={rules} help={help} className="mb-0">
      <Select
        size="large"
        showSearch
        filterOption={false}
        onSearch={(value) => {
          // In a real production app, this should be debounced
          fetchOptions(value);
        }}
        notFoundContent={loading ? <LoadingSpinner size="small" /> : null}
        options={data}
        {...props}
      />
    </Form.Item>
  );
}
