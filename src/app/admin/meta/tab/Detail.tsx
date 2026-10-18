"use client";

import React from "react";
import { Tooltip, Tag } from "antd";
import { CopyOutlined, ReloadOutlined, InfoCircleFilled } from "@ant-design/icons";
import InputField from "@/common/form/InputField";
import PasswordField from "@/common/form/PasswordField";
import LabelField from "@/common/form/LabelField";
import ButtonField from "@/common/basic/ButtonField";
import { usePermission } from "@/components/auth/PermissionGuard";

interface DetailProps {
  control: any;
  setValue?: any;
  callbackUrl?: string;
  verifyToken: string;
  copyToClipboard: (text?: string, label?: string) => void;
  generateNewToken: () => void;
}

export const Detail: React.FC<DetailProps> = ({
  control,
  callbackUrl,
  verifyToken,
  copyToClipboard,
  generateNewToken,
}) => {
  const canUpdate = usePermission("meta:update");
  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 pb-12 items-start justify-between">
      {/* Left side: Configuration form & Field mapping */}
      <div className="flex-1 min-w-0 max-w-[650px] flex flex-col gap-8">
        {/* Webhook Configuration */}
        <div>
          <h3 className="text-base font-bold text-primary mb-4">
            Webhook Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full">
            <div className="flex flex-col">
              <LabelField tooltip="Must be accessible over HTTPS by Meta's servers">
                Webhook URL
              </LabelField>
              <InputField
                id="callbackUrl"
                control={control}
                disabled
                className="bg-secondary/40"
                suffix={
                  <Tooltip title="Copy Webhook URL">
                    <ButtonField
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(callbackUrl, "Webhook URL")}
                      className="text-text-secondary hover:text-primary p-0.5 h-auto"
                    />
                  </Tooltip>
                }
              />
            </div>

            <div className="flex flex-col">
              <LabelField tooltip="Secret string validated by Meta when saving the webhook">
                Verify Token
              </LabelField>
              <InputField
                id="verifyToken"
                control={control}
                disabled={!canUpdate}
                placeholder="Enter verify token"
                suffix={
                  <div className="flex items-center gap-1.5">
                    <Tooltip title="Copy Verify Token">
                      <ButtonField
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(verifyToken, "Verify Token")}
                        className="text-text-secondary hover:text-primary p-0.5 h-auto"
                      />
                    </Tooltip>
                    <Tooltip title="Regenerate Token">
                      <ButtonField
                        type="text"
                        size="small"
                        icon={<ReloadOutlined />}
                        disabled={!canUpdate}
                        onClick={generateNewToken}
                        className="text-text-secondary hover:text-primary p-0.5 h-auto"
                      />
                    </Tooltip>
                  </div>
                }
              />
            </div>
          </div>
        </div>

        {/* Meta API Credentials */}
        <div>
          <h3 className="text-base font-bold text-primary mb-4">
            Meta API Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelField required tooltip="Permanent System User token with leads_retrieval, pages_show_list, and pages_manage_ads permissions">
                  Page Access Token
                </LabelField>
                <a
                  href="https://business.facebook.com/settings/system-users"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Meta Business Suite →
                </a>
              </div>
              <PasswordField
                id="pageAccessToken"
                control={control}
                disabled={!canUpdate}
                placeholder="EAAG... (Paste permanent System User token)"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <LabelField tooltip="Optional App Secret from Meta Developer portal for payload HMAC verification">
                  App Secret
                </LabelField>
              </div>
              <PasswordField
                id="appSecret"
                control={control}
                disabled={!canUpdate}
                placeholder="Meta App Secret"
              />
            </div>

            <div className="flex flex-col">
              <LabelField tooltip="Optional numeric ID of your connected Facebook page">
                Facebook Page ID
              </LabelField>
              <InputField
                id="pageId"
                control={control}
                disabled={!canUpdate}
                placeholder="e.g. 104928492049"
              />
            </div>

            <div className="flex flex-col">
              <LabelField tooltip="Auto-populated when testing connection">
                Connected Page Name
              </LabelField>
              <InputField
                id="pageName"
                control={control}
                disabled={!canUpdate}
                placeholder="Auto-detected upon connection"
              />
            </div>
          </div>
        </div>

        {/* Field Mapping */}
        <div>
          <h3 className="text-base font-bold text-primary mb-1">
            Field Mapping
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Standard instant form fields automatically mapped to CRM lead attributes.
          </p>

          <div className="w-full border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 border-b border-border text-text-primary font-semibold">
                <tr>
                  <th className="p-3">Meta Instant Form Key</th>
                  <th className="p-3">CRM Lead Attribute</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-mono text-primary font-medium">full_name / name</td>
                  <td className="p-3 font-medium text-text-primary">Full Name</td>
                  <td className="p-3 text-text-secondary">Text</td>
                  <td className="p-3">
                    <Tag color="success">Auto-Mapped</Tag>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-medium">phone_number / phone</td>
                  <td className="p-3 font-medium text-text-primary">Phone</td>
                  <td className="p-3 text-text-secondary">Phone / E.164</td>
                  <td className="p-3">
                    <Tag color="success">Auto-Mapped</Tag>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-medium">email</td>
                  <td className="p-3 font-medium text-text-primary">Email Address</td>
                  <td className="p-3 text-text-secondary">Email</td>
                  <td className="p-3">
                    <Tag color="success">Auto-Mapped</Tag>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-medium">city</td>
                  <td className="p-3 font-medium text-text-primary">City</td>
                  <td className="p-3 text-text-secondary">Text</td>
                  <td className="p-3">
                    <Tag color="success">Auto-Mapped</Tag>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-medium">loan_type / type_of_loan</td>
                  <td className="p-3 font-medium text-text-primary">Loan Type</td>
                  <td className="p-3 text-text-secondary">Dropdown</td>
                  <td className="p-3">
                    <Tag color="success">Auto-Mapped</Tag>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-medium">total_debt / debt_amount</td>
                  <td className="p-3 font-medium text-text-primary">Total Debt Amount</td>
                  <td className="p-3 text-text-secondary">Number</td>
                  <td className="p-3">
                    <Tag color="success">Auto-Mapped</Tag>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-text-secondary">custom_questions</td>
                  <td className="p-3 font-medium text-text-primary">rawFields</td>
                  <td className="p-3 text-text-secondary">Object</td>
                  <td className="p-3">
                    <Tag color="default">Details</Tag>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right side: Notes / Info Card */}
      <div className="w-full lg:w-[320px] xl:w-[320px] shrink-0 sticky top-4">
        <div className="rounded-2xl border border-[#FBCFD0] bg-[#FFF9F9] p-4 sm:p-5 shadow-sm">
          {/* Header */}
          <div className="flex items-start gap-2.5 mb-5">
            <InfoCircleFilled className="text-xl text-[#1E293B] shrink-0 mt-0.5" />
            <h4 className="text-base font-bold text-[#1E293B] leading-snug">
              Info about &quot;Meta Integration&quot; & its functionality
            </h4>
          </div>

          {/* Bullet Items */}
          <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
            <div>
              <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                <span className="text-[#1E293B]">•</span>
                <span>Webhook URL</span>
              </div>
              <p className="mt-1 pl-3 text-[#475569]">
                Public HTTPS endpoint where Meta sends real-time lead event updates. Copy and paste this URL into <strong>Meta Developers &gt; App &gt; Webhooks &gt; Page &gt; leadgen</strong>.
              </p>
            </div>

            <div>
              <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                <span className="text-[#1E293B]">•</span>
                <span>Verify Token</span>
              </div>
              <p className="mt-1 pl-3 text-[#475569]">
                A shared secret string used during Meta’s webhook subscription handshake. Enter the exact same value in both this CRM field and the Meta Webhook setup dialog.
              </p>
            </div>

            <div>
              <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                <span className="text-[#1E293B]">•</span>
                <span>Page Access Token</span>
              </div>
              <p className="mt-1 pl-3 text-[#475569]">
                Permanent System User token generated in <strong>Meta Business Suite &gt; Settings &gt; System Users</strong>. Requires <code className="bg-white/80 px-1 py-0.5 rounded text-[11px] text-primary">leads_retrieval</code> and <code className="bg-white/80 px-1 py-0.5 rounded text-[11px] text-primary">pages_show_list</code> permissions to fetch lead contact info.
              </p>
            </div>

            <div>
              <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                <span className="text-[#1E293B]">•</span>
                <span>Facebook Page ID & Name</span>
              </div>
              <p className="mt-1 pl-3 text-[#475569]">
                Numerical ID of your Facebook Page. Can be found in <strong>Page &gt; About</strong> or automatically detected when clicking <strong>Test Connection</strong>.
              </p>
            </div>

            <div>
              <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                <span className="text-[#1E293B]">•</span>
                <span>App Secret</span>
              </div>
              <p className="mt-1 pl-3 text-[#475569]">
                Found in <strong>Meta Developers &gt; App Settings &gt; Basic</strong>. Enables cryptographic HMAC SHA-256 signature verification (<code className="bg-white/80 px-1 py-0.5 rounded text-[11px]">X-Hub-Signature-256</code>) to ensure incoming requests genuinely originate from Meta.
              </p>
            </div>

            <div>
              <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
                <span className="text-[#1E293B]">•</span>
                <span>Real-Time Ingestion Flow</span>
              </div>
              <p className="mt-1 pl-3 text-[#475569]">
                When an ad lead form is submitted, Meta pushes a webhook with a <code className="bg-white/80 px-1 py-0.5 rounded text-[11px]">leadgen_id</code>. The CRM calls Graph API with your token, extracts field answers, matches them to CRM attributes, and creates the lead instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
