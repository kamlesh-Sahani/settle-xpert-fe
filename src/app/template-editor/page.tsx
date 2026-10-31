"use client";

import React from "react";
import { TemplateEditor, TemplateData } from "@/components/template-editor";
import { message } from "antd";

export default function TemplateEditorTestPage() {
  const handleSave = async (data: TemplateData) => {
    // Log to console for easy inspection during testing
    console.log("Template saved payload:", data);
    message.success(`Saved template "${data.title}" successfully! Check console for payload.`);
  };

  return (
    <div className="w-full h-screen">
      <TemplateEditor
        saveEndpoint="/api/v1/template"
        onSave={handleSave}
      />
    </div>
  );
}
