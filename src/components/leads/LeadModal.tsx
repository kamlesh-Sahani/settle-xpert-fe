"use client";

import { Modal, Form as AntForm, Input, Select, Button } from "antd";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  phone: z.string().min(10, "Phone number should be at least 10 digits").max(15, "Phone number too long").optional().or(z.literal("")),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]),
  source: z.enum(["FB_ADS", "ORGANIC", "FORM"]),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  lead?: {
    id?: string;
    contact: {
      name: string;
      email: string;
      phone?: string;
    };
    status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
    source: "FB_ADS" | "ORGANIC" | "FORM";
  } | null;
}

export default function LeadModal({ open, onClose, lead }: LeadModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "NEW",
      source: "FORM",
    },
  });

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.contact.name,
        email: lead.contact.email,
        phone: lead.contact.phone || "",
        status: lead.status,
        source: lead.source,
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        status: "NEW",
        source: "FORM",
      });
    }
  }, [lead, open, reset]);

  const onSubmit = async (_values: LeadFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={lead ? "Edit Lead" : "Add New Lead"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <AntForm layout="vertical" onFinish={handleSubmit(onSubmit)} className="mt-4">
        <AntForm.Item
          label="Full Name"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} placeholder="John Doe" aria-label="Full Name" />}
          />
        </AntForm.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AntForm.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} placeholder="john@example.com" aria-label="Email" />}
            />
          </AntForm.Item>
          <AntForm.Item
            label="Phone"
            validateStatus={errors.phone ? "error" : ""}
            help={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <Input {...field} placeholder="+1234567890" aria-label="Phone" />}
            />
          </AntForm.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AntForm.Item
            label="Status"
            validateStatus={errors.status ? "error" : ""}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} aria-label="Status">
                  <Select.Option value="NEW">New</Select.Option>
                  <Select.Option value="CONTACTED">Contacted</Select.Option>
                  <Select.Option value="QUALIFIED">Qualified</Select.Option>
                  <Select.Option value="CLOSED">Closed</Select.Option>
                </Select>
              )}
            />
          </AntForm.Item>

          <AntForm.Item
            label="Source"
            validateStatus={errors.source ? "error" : ""}
            help={errors.source?.message}
          >
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select {...field} aria-label="Source">
                  <Select.Option value="FB_ADS">Facebook Ads</Select.Option>
                  <Select.Option value="ORGANIC">Organic</Select.Option>
                  <Select.Option value="FORM">Website Form</Select.Option>
                </Select>
              )}
            />
          </AntForm.Item>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {lead ? "Save Changes" : "Create Lead"}
          </Button>
        </div>
      </AntForm>
    </Modal>
  );
}
