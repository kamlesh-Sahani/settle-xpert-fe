import { VariableItem, TemplateData } from "./templateEditor.types";

export const DEFAULT_VARIABLES: VariableItem[] = [
  { key: "{{lead.first_name}}", label: "Lead First Name", category: "Lead", previewValue: "John" },
  { key: "{{lead.last_name}}", label: "Lead Last Name", category: "Lead", previewValue: "Doe" },
  { key: "{{lead.email}}", label: "Lead Email", category: "Lead", previewValue: "john.doe@example.com" },
  { key: "{{lead.phone}}", label: "Lead Phone", category: "Lead", previewValue: "+1 555-0199" },
  { key: "{{lead.company}}", label: "Lead Company", category: "Lead", previewValue: "Acme Corp" },
  { key: "{{lead.status}}", label: "Lead Status", category: "Lead", previewValue: "QUALIFIED" },

  { key: "{{company.name}}", label: "Our Company Name", category: "Company", previewValue: "LeadCRM Global Inc." },
  { key: "{{company.email}}", label: "Our Company Email", category: "Company", previewValue: "contact@leadcrm.com" },
  { key: "{{company.phone}}", label: "Our Company Phone", category: "Company", previewValue: "+1 800-555-0100" },
  { key: "{{company.website}}", label: "Our Website", category: "Company", previewValue: "https://leadcrm.com" },
  { key: "{{company.address}}", label: "Our Address", category: "Company", previewValue: "100 Innovation Way, Suite 400" },

  { key: "{{employee.name}}", label: "Agent / Assigned To", category: "Employee", previewValue: "Sarah Jenkins" },
  { key: "{{employee.email}}", label: "Agent Email", category: "Employee", previewValue: "sarah.j@leadcrm.com" },
  { key: "{{employee.role}}", label: "Agent Role", category: "Employee", previewValue: "Senior Account Executive" },

  { key: "{{system.current_date}}", label: "Current Date", category: "System", previewValue: "October 28, 2026" },
  { key: "{{system.document_id}}", label: "Document ID", category: "System", previewValue: "DOC-2026-8842" },
  { key: "{{system.page_number}}", label: "Page Number", category: "System", previewValue: "1" },
];

export const INITIAL_TEMPLATE_DATA: TemplateData = {
  title: "Untitled Proposal Template",
  header: {
    enabled: true,
    title: "Official Business Proposal",
    subtitle: "Prepared for: {{lead.company}}",
    logoUrl: "",
    alignment: "left",
    showDivider: true,
  },
  body: `<h2>Proposal for {{lead.first_name}} {{lead.last_name}}</h2>
<p>Dear {{lead.first_name}},</p>
<p>Thank you for considering {{company.name}} for your business needs. Below is the preliminary proposal outlining our agreement, scope of deliverables, and terms.</p>
<br/>
<table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
  <thead>
    <tr style="background-color: #f9fafb;">
      <th style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left;">Item Description</th>
      <th style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right;">Qty</th>
      <th style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right;">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #e5e7eb; padding: 8px 12px;">Enterprise CRM License</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right;">10</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right;">$1,200.00</td>
    </tr>
    <tr>
      <td style="border: 1px solid #e5e7eb; padding: 8px 12px;">Implementation & Onboarding Support</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right;">1</td>
      <td style="border: 1px solid #e5e7eb; padding: 8px 12px; text-align: right;">$500.00</td>
    </tr>
  </tbody>
</table>
<br/>
<p>If you have any questions or require revisions, please contact {{employee.name}} at {{employee.email}}.</p>`,
  footer: {
    enabled: true,
    text: "Confidential • {{company.name}} • All rights reserved.",
    showPageNumbers: true,
    showDivider: true,
  },
  settings: {
    orientation: "portrait",
    margins: "normal",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
  },
};
