"use client";

import React from "react";
import { Input, Select, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useFormContext } from "react-hook-form";
import LabelField from "@/common/form/LabelField";
import InputField from "@/common/form/InputField";
import PhoneField from "@/common/form/PhoneField";
import DateField from "@/common/form/DateField";
import CountryField from "@/common/form/CountryField";
import TextAreaField from "@/common/form/TextAreaField";
import SelectField from "@/common/form/SelectField";
import SelectApiField from "@/common/form/SelectApiField";
import ButtonField from "@/common/basic/ButtonField";
import {
  LeadSchema,
  DebtItem,
  serviceOptions,
  sourceOptions,
  priorityOptions,
  loanTypeOptions,
} from "../lead.utils";

interface LeadDetailsProps {
  canAssign?: boolean;
  debts: DebtItem[];
  setDebts: React.Dispatch<React.SetStateAction<DebtItem[]>>;
}

export default function LeadDetails({
  canAssign = false,
  debts,
  setDebts,
}: LeadDetailsProps) {
  const { control, setValue } = useFormContext<LeadSchema>();

  const handleAddLoan = () => {
    const updated = [
      ...debts,
      {
        lender: "",
        loanType: "Personal Loan",
        outstandingAmount: 0,
        monthlyEmi: 0,
      },
    ];
    setDebts(updated);
    setValue("debts", updated, { shouldDirty: true });

    const totalSum = updated.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0);
    setValue("totalDebtAmount", totalSum, { shouldDirty: true });
    setValue("outstandingAmount", totalSum, { shouldDirty: true });
  };

  const handleUpdateDebt = (index: number, field: keyof DebtItem, value: any) => {
    const updated = debts.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setDebts(updated);
    setValue("debts", updated, { shouldDirty: true });

    const totalSum = updated.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0);
    setValue("totalDebtAmount", totalSum, { shouldDirty: true });
    setValue("outstandingAmount", totalSum, { shouldDirty: true });
  };

  const handleRemoveLoan = (index: number) => {
    const updated = debts.filter((_, i) => i !== index);
    setDebts(updated);
    setValue("debts", updated, { shouldDirty: true });

    const totalSum = updated.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0);
    setValue("totalDebtAmount", totalSum, { shouldDirty: true });
    setValue("outstandingAmount", totalSum, { shouldDirty: true });
  };

  const totalLoansSum = debts.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0);

  return (
    <div className="w-full flex flex-col gap-8 max-w-[620px]">
      {/* Section 1: Contact Information */}
      <div>
        <h3 className="text-base font-bold text-text-primary mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full">
          <div className="flex flex-col">
            <LabelField required>Full Name</LabelField>
            <InputField
              id="fullName"
              control={control as any}
              placeholder="Enter full name"
            />
          </div>

          <div className="flex flex-col">
            <LabelField required>Phone Number</LabelField>
            <PhoneField
              id="phone"
              control={control as any}
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex flex-col">
            <LabelField>
              Alternate Phone <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <PhoneField
              id="alternatePhone"
              control={control as any}
              placeholder="Enter alternate number"
            />
          </div>

          <div className="flex flex-col">
            <LabelField>
              Email Address <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="email"
              type="email"
              control={control as any}
              placeholder="Enter email address"
            />
          </div>

          <div className="flex flex-col">
            <LabelField>
              Date of Birth <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <DateField
              id="dob"
              control={control as any}
              placeholder="Select Date of Birth"
            />
          </div>

          <div className="flex flex-col">
            <LabelField>
              PAN Number <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="panCard"
              control={control as any}
              placeholder="Enter PAN card number"
            />
          </div>

          <div className="flex flex-col">
            <LabelField required tooltip="Registered country">
              Country
            </LabelField>
            <CountryField
              id="address.country"
              name="address.country"
              control={control as any}
              placeholder="Select Your Country"
            />
          </div>

          <div className="flex flex-col">
            <LabelField>
              State <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="address.state"
              name="address.state"
              control={control as any}
              placeholder="Mention Your State Na..."
            />
          </div>

          <div className="flex flex-col">
            <LabelField>
              City <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="address.city"
              name="address.city"
              control={control as any}
              placeholder="Mention Your City Na..."
            />
          </div>

          <div className="flex flex-col">
            <LabelField>
              Zipcode <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="address.zip"
              name="address.zip"
              control={control as any}
              placeholder="Mention Area Zipcode"
            />
          </div>
        </div>

        <div className="w-full mt-5 flex flex-col">
          <LabelField>
            Full Address <span className="text-text-secondary font-normal">(Optional)</span>
          </LabelField>
          <TextAreaField
            id="address.line1"
            name="address.line1"
            control={control as any}
            placeholder="Enter Complete Address"
            rows={3}
          />
        </div>
      </div>

      {/* Section 2: Enquiry Details */}
      <div className="border-t border-border pt-6">
        <h3 className="text-base font-bold text-text-primary mb-4">Enquiry Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full mb-5">
          <div className="flex flex-col">
            <LabelField required>Service Required</LabelField>
            <SelectField
              id="serviceRequired"
              control={control as any}
              placeholder="Select service"
              options={serviceOptions}
            />
          </div>

          <div className="flex flex-col">
            <LabelField required>Lead Source</LabelField>
            <SelectField
              id="source"
              control={control as any}
              placeholder="Select lead source"
              options={sourceOptions}
            />
          </div>

          <div className="flex flex-col">
            <LabelField>Priority</LabelField>
            <SelectField
              id="priority"
              control={control as any}
              placeholder="Select priority"
              options={priorityOptions}
            />
          </div>
        </div>

        <div className="w-full flex flex-col">
          <LabelField>
            Initial Client Discussion / Hardship Notes <span className="text-text-secondary font-normal">(Optional)</span>
          </LabelField>
          <TextAreaField
            id="initialEnquiry"
            rows={3}
            control={control as any}
            placeholder="Record what the client discussed on the initial call (e.g. debt crisis, harassment by recovery agents, immediate concerns, customer expectations)..."
          />
        </div>
      </div>

      {/* Section 3: Loan & Financial Details */}
      <div className="border-t border-border pt-6">
        <h3 className="text-base font-bold text-text-primary mb-4">Loan & Financial Details</h3>

        {/* Outstanding Amount, Income and EMIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-5 w-full mb-6">
          <div className="flex flex-col justify-between">
            <LabelField className="sm:min-h-[42px] !items-start">
              Outstanding Amount (₹) <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="outstandingAmount"
              type="number"
              control={control as any}
              placeholder="e.g. 250000"
            />
          </div>

          <div className="flex flex-col justify-between">
            <LabelField className="sm:min-h-[42px] !items-start">
              Monthly Income (₹) <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="monthlyIncome"
              type="number"
              control={control as any}
              placeholder="e.g. 30000"
            />
          </div>

          <div className="flex flex-col justify-between">
            <LabelField className="sm:min-h-[42px] !items-start">
              Current Total EMIs (₹) <span className="text-text-secondary font-normal">(Optional)</span>
            </LabelField>
            <InputField
              id="currentEmiAmount"
              type="number"
              control={control as any}
              placeholder="e.g. 18000"
            />
          </div>
        </div>

        {/* Loan Section: Bank / Lender, Loan Type, Outstanding Amount, Action */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Setup loans based on multiple creditors
            </span>
            <ButtonField
              type="default"
              onClick={handleAddLoan}
              className="text-primary !border-primary/50 hover:!border-primary hover:!text-primary font-semibold text-xs rounded-lg px-3.5 h-8 flex items-center gap-1.5"
            >
              <PlusOutlined className="text-[10px]" /> Add More
            </ButtonField>
          </div>

          <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/90 bg-slate-50/70 text-xs font-semibold text-slate-700">
                    <th className="py-3 px-3.5">Bank / Lender*</th>
                    <th className="py-3 px-3.5">Loan Type*</th>
                    <th className="py-3 px-3.5">Outstanding Amount*</th>
                    <th className="py-3 px-3.5 w-14 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debts.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-2.5 px-3.5 align-middle">
                        <Input
                          placeholder="e.g. HDFC Bank, SBI"
                          value={item.lender}
                          onChange={(e) => handleUpdateDebt(index, "lender", e.target.value)}
                          className="h-9 rounded-md border-slate-300 text-sm"
                        />
                      </td>
                      <td className="py-2.5 px-3.5 align-middle min-w-[140px]">
                        <Select
                          value={item.loanType}
                          onChange={(val) => handleUpdateDebt(index, "loanType", val)}
                          options={loanTypeOptions}
                          className="w-full h-9 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selector]:!border-slate-300"
                        />
                      </td>
                      <td className="py-2.5 px-3.5 align-middle min-w-[130px]">
                        <InputNumber
                          placeholder="0"
                          value={item.outstandingAmount || null}
                          onChange={(val) => handleUpdateDebt(index, "outstandingAmount", Number(val) || 0)}
                          className="w-full h-9 rounded-md border-slate-300 text-sm"
                          formatter={(val) => val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                          parser={(val) => val?.replace(/\$\s?|(,*)/g, "") as any}
                        />
                      </td>
                      <td className="py-2.5 px-3.5 align-middle text-center w-14">
                        <button
                          type="button"
                          onClick={() => handleRemoveLoan(index)}
                          className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-500 hover:border-red-300 transition-colors cursor-pointer"
                          title="Remove loan"
                        >
                          <DeleteOutlined className="text-base" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {debts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                        No loans added yet. Click{" "}
                        <button
                          type="button"
                          onClick={handleAddLoan}
                          className="text-primary font-semibold hover:underline cursor-pointer"
                        >
                          + Add More
                        </button>{" "}
                        to add creditor liabilities.
                      </td>
                    </tr>
                  )}
                </tbody>
                {debts.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-200/90 bg-slate-50/50 text-xs">
                      <td colSpan={2} className="py-2.5 px-3.5 font-medium text-slate-500">
                        Total ({debts.length} account{debts.length > 1 ? "s" : ""})
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-rose-600 text-sm">
                        ₹{totalLoansSum.toLocaleString("en-IN")}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Assignment */}
      <div className="border-t border-border pt-6">
        <h3 className="text-base font-bold text-text-primary mb-4">Assignment</h3>
        <div className="w-full">
          <div className="flex flex-col">
            <LabelField>
              Assigned Counselor
              {!canAssign && (
                <span className="text-text-secondary font-normal text-xs ml-1">
                  (Manager permission required)
                </span>
              )}
            </LabelField>
            {canAssign ? (
              <SelectApiField
                id="assignedTo"
                apiUrl="/api/v1/emp/options"
                placeholder="Select counselor or leave unassigned"
                control={control as any}
              />
            ) : (
              <div className="h-10 px-3 flex items-center rounded-lg border border-border bg-background text-sm text-text-tertiary">
                Unassigned (Assigned by Manager)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
