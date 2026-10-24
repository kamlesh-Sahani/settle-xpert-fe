export interface MetaConfig {
  id?: string;
  status: "ACTIVE" | "IN_ACTIVE";
  verifyToken: string;
  pageId: string;
  pageName: string;
  hasAccessToken: boolean;
  maskedAccessToken: string;
  hasAppSecret: boolean;
  fieldMapping: Record<string, string>;
  callbackUrl: string;
  updatedAt?: string;
}

export interface WebhookLog {
  id: string;
  leadgenId: string;
  pageId: string;
  formId: string;
  leadNumber?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  status: "SUCCESS" | "DUPLICATE" | "FAILED";
  errorMessage?: string;
  createdAt: string;
}

export interface UserOption {
  key: string;
  value: string;
  email?: string;
}
