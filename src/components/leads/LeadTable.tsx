"use client";

import { Table, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined } from "@ant-design/icons";
import DeleteIcon from "@/assets/icons/deleteIcon";

interface Lead {
  id: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  status: string;
  source: string;
}

const mockData: Lead[] = [
  {
    id: "1",
    contact: { name: "Alice Smith", email: "alice@example.com", phone: "+1234567890" },
    status: "NEW",
    source: "FB_ADS"
  },
  {
    id: "2",
    contact: { name: "Bob Jones", email: "bob@example.com", phone: "+0987654321" },
    status: "QUALIFIED",
    source: "ORGANIC"
  }
];

interface LeadTableProps {
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export default function LeadTable({ onEdit, onDelete }: LeadTableProps) {
  const columns: ColumnsType<Lead> = [
    {
      title: "Name",
      dataIndex: ["contact", "name"],
      key: "name",
      render: (text) => <span className="font-medium text-text-primary">{text}</span>
    },
    {
      title: "Email",
      dataIndex: ["contact", "email"],
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: ["contact", "phone"],
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        if (status === "QUALIFIED") color = "green";
        if (status === "CLOSED") color = "purple";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source) => <Tag>{source}</Tag>
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button type="text" danger icon={<DeleteIcon width={16} height={16} />} onClick={() => onDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="bg-background p-4 rounded-lg shadow-sm border border-border">
      <Table 
        columns={columns} 
        dataSource={mockData} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
