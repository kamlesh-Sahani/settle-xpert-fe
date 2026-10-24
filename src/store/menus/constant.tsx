import {
  AppstoreOutlined,
  TeamOutlined,
  ContactsOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  CalculatorOutlined,
  CheckSquareOutlined,
  BankOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import MetaIcon from "@/assets/icons/MetaIcon";

export const mainMenu = [
  {
    key: "dashboard",
    icon: <AppstoreOutlined className="text-[17px]" />,
    label: "Dashboard",
    route: "/dashboard" as any,
    permission: "dashboard:read",
  },
  {
    key: "leads",
    icon: <ContactsOutlined className="text-[17px]" />,
    label: "Leads",
    route: "/leads" as any,
    permission: "lead:read",
  },
  {
    key: "customers",
    icon: <TeamOutlined className="text-[17px]" />,
    label: "Customers",
    route: "/customers" as any,
    permission: "customer:read",
  },
  {
    key: "loans",
    icon: <BankOutlined className="text-[17px]" />,
    label: "Loans & Debts",
    route: "/loans" as any,
    permission: "loan:read",
  },
  {
    key: "cases",
    icon: <FolderOpenOutlined className="text-[17px]" />,
    label: "Case Management",
    route: "/cases" as any,
    permission: "case:read",
  },
  {
    key: "assessments",
    icon: <CalculatorOutlined className="text-[17px]" />,
    label: "Debt Assessments",
    route: "/assessments" as any,
    permission: "assessment:read",
  },
  {
    key: "tasks",
    icon: <CheckSquareOutlined className="text-[17px]" />,
    label: "Tasks & Follow-ups",
    route: "/tasks" as any,
    permission: "task:read",
  },
  {
    key: "complaints",
    icon: <AlertOutlined className="text-[17px]" />,
    label: "Harassment & Complaints",
    route: "/complaints" as any,
    permission: "complaint:read",
  },
];

export const adminMenu = [
  {
    key: "employee",
    icon: <TeamOutlined className="text-[17px]" />,
    label: "Employees",
    route: "/admin/employee" as any,
    permission: "employee:read",
  },
  {
    key: "role-management",
    icon: <SafetyCertificateOutlined className="text-[17px]" />,
    label: "Role Management",
    route: "/admin/roles" as any,
    permission: "role:read",
  },
  {
    key: "meta",
    icon: <MetaIcon className="text-[17px]" />,
    label: "Meta",
    route: "/admin/meta" as any,
    permission: "meta:read",
  },
];