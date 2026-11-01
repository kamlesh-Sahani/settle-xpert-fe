import {
  AppstoreOutlined,
  TeamOutlined,
  ContactsOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
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
    route: "/employee/leads" as any,
    permission: "lead:read",
  },
  {
    key: "customers",
    icon: <TeamOutlined className="text-[17px]" />,
    label: "Customers",
    route: "/customers" as any,
    permission: "customer:read",
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
    key: "departments",
    icon: <ApartmentOutlined className="text-[17px]" />,
    label: "Departments",
    route: "/admin/departments" as any,
    permission: "department:read",
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