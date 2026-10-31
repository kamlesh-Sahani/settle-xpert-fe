"use client";

import React, { useState } from "react";
import { Input, Tag, Tooltip, Empty } from "antd";
import { MdSearch, MdContentCopy, MdAdd } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi2";
import ButtonField from "@/common/basic/ButtonField";
import { VariableItem } from "./templateEditor.types";

interface VariableSidebarProps {
  variables: VariableItem[];
  onInsertVariable: (variableKey: string) => void;
  onAddCustomVariable?: (variable: VariableItem) => void;
}

export default function VariableSidebar({
  variables,
  onInsertVariable,
  onAddCustomVariable,
}: VariableSidebarProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarLabel, setNewVarLabel] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = ["All", "Lead", "Company", "Employee", "System", "Custom"];

  const filteredVariables = variables.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.key.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateCustom = () => {
    if (!newVarKey.trim() || !newVarLabel.trim()) return;
    const formattedKey = newVarKey.startsWith("{{") ? newVarKey : `{{custom.${newVarKey.trim()}}}`;
    onAddCustomVariable?.({
      key: formattedKey,
      label: newVarLabel.trim(),
      category: "Custom",
      previewValue: "Custom Value",
    });
    setNewVarKey("");
    setNewVarLabel("");
    setShowAddForm(false);
  };

  return (
    <aside className="w-72 border-r flex flex-col h-full bg-white select-none" style={{ borderColor: "var(--border)" }}>
      {/* Sidebar Header */}
      <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="text-primary text-base" />
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Dynamic Variables</span>
        </div>
        <Tooltip title="Add Custom Variable">
          <ButtonField
            size="small"
            type="text"
            icon={<MdAdd />}
            onClick={() => setShowAddForm(!showAddForm)}
          />
        </Tooltip>
      </div>

      {/* Add Custom Variable Drawer/Form */}
      {showAddForm && (
        <div className="p-3 bg-gray-50 border-b flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
          <span className="text-[11px] font-semibold text-gray-600">New Custom Variable</span>
          <Input
            size="small"
            placeholder="Label (e.g. Discount Code)"
            value={newVarLabel}
            onChange={(e) => setNewVarLabel(e.target.value)}
          />
          <Input
            size="small"
            placeholder="Key (e.g. discount_code)"
            value={newVarKey}
            onChange={(e) => setNewVarKey(e.target.value)}
          />
          <div className="flex justify-end gap-1.5 mt-1">
            <ButtonField size="small" onClick={() => setShowAddForm(false)}>
              Cancel
            </ButtonField>
            <ButtonField size="small" type="primary" onClick={handleCreateCustom}>
              Add
            </ButtonField>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
        <Input
          size="small"
          prefix={<MdSearch className="text-gray-400 text-sm" />}
          placeholder="Search variables..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b no-scrollbar" style={{ borderColor: "var(--border)" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Variable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredVariables.length === 0 ? (
          <div className="py-8">
            <Empty description="No variables found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          filteredVariables.map((v) => (
            <div
              key={v.key}
              className="group p-2 rounded-lg border border-gray-100 hover:border-primary-300 hover:bg-primary-5 transition-all flex flex-col gap-1 cursor-pointer"
              onClick={() => onInsertVariable(v.key)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800 truncate">{v.label}</span>
                <Tag className="m-0 text-[10px] px-1 py-0 rounded border-0 bg-gray-100 text-gray-500 font-normal">
                  {v.category}
                </Tag>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-[11px] text-primary font-mono bg-white px-1 py-0.5 rounded border border-gray-200 truncate">
                  {v.key}
                </code>
                <Tooltip title="Click to insert at cursor">
                  <span className="text-[10px] text-gray-400 group-hover:text-primary transition-colors flex items-center gap-0.5">
                    Insert ↵
                  </span>
                </Tooltip>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Helper Footer */}
      <div className="p-2 border-t bg-gray-50 text-[10.5px] text-gray-500" style={{ borderColor: "var(--border)" }}>
        Tip: Click any variable pill to insert it directly into the active editor caret.
      </div>
    </aside>
  );
}
