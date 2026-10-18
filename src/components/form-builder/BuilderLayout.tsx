"use client";

import { Layout, Button, Tooltip, Tag, Modal } from "antd";
import { useState } from "react";
import { MdPreview, MdSave, MdUndo, MdRedo, MdCode } from "react-icons/md";
import { HiOutlineTemplate } from "react-icons/hi";
import FieldLibrary from "./FieldLibrary";
import FormCanvas from "./FormCanvas";
import FieldSettings from "./FieldSettings";
import { useFormBuilder } from "@/store/form/formBuilder.store";

const { Sider, Content } = Layout;

export default function BuilderLayout() {
  const { form } = useFormBuilder();
  const fieldCount = form.order.length;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);

  return (
    <Layout className="h-screen" style={{ background: "var(--background)" }}>
      {/* ── Top Header ── */}
      <div
        className="flex items-center justify-between px-5 py-3 backdrop-blur-xl z-20"
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            <HiOutlineTemplate className="text-white text-lg" />
          </div>
          <div>
            <h1
              className="text-[15px] font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Form Builder
            </h1>
            <p
              className="text-[10.5px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Visual drag & drop editor
            </p>
          </div>
          <Tag
            className="rounded-full text-[10px] font-bold ml-1 border-0"
            style={{
              background: "var(--primary-100)",
              color: "var(--primary-700)",
            }}
          >
            {fieldCount} {fieldCount === 1 ? "field" : "fields"}
          </Tag>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Tooltip title="Undo">
            <Button
              type="text"
              icon={<MdUndo />}
              style={{ color: "var(--text-secondary)" }}
            />
          </Tooltip>
          <Tooltip title="Redo">
            <Button
              type="text"
              icon={<MdRedo />}
              style={{ color: "var(--text-secondary)" }}
            />
          </Tooltip>
          <div
            className="w-px h-6 mx-1"
            style={{ background: "var(--border)" }}
          />
          <Tooltip title="View JSON">
            <Button
              icon={<MdCode />}
              className="rounded-lg"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
              onClick={() => setIsJsonOpen(true)}
            >
              JSON
            </Button>
          </Tooltip>
          <Button
            icon={<MdPreview />}
            className="rounded-lg"
            style={{
              color: "var(--text-primary)",
              borderColor: "var(--border)",
            }}
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button
            type="primary"
            icon={<MdSave />}
            className="rounded-lg font-semibold border-0"
            style={{ background: "var(--primary)" }}
          >
            Save Form
          </Button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <Layout
        className="bg-transparent"
        style={{ height: "calc(100vh - 56px)" }}
      >
        {/* Left Panel */}
        <Sider
          width={280}
          className="bg-background/80 backdrop-blur-xl"
          style={{
            borderRight: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          <FieldLibrary />
        </Sider>

        {/* Center Canvas */}
        <Content className="bg-transparent">
          <FormCanvas />
        </Content>

        {/* Right Panel */}
        <Sider
          width={320}
          className="bg-background/80 backdrop-blur-xl"
          style={{
            borderLeft: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          <FieldSettings />
        </Sider>
      </Layout>

      {/* JSON Modal */}
      <Modal
        title="Form JSON Definition"
        open={isJsonOpen}
        onCancel={() => setIsJsonOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsJsonOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <pre
          className="p-4 rounded-lg overflow-auto max-h-[500px]"
          style={{
            background: "var(--background)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          {JSON.stringify(form, null, 2)}
        </pre>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Form Preview"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div
          className="p-8 rounded-xl"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Form Preview
            </h2>
            <div className="space-y-4">
              {form.order.map((id) => {
                const field = form.fields[id];
                return (
                  <div key={id}>
                    <label
                      className="block text-sm font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {field.label}
                    </label>
                    <div className="text-slate-400 text-xs mb-2">
                      Type: {field.type}
                    </div>
                    <div
                      className="p-2 border rounded"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {field.placeholder || "Input field"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
