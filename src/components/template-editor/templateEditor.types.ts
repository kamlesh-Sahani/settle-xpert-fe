export interface VariableItem {
  key: string;
  label: string;
  category: "Lead" | "Company" | "Employee" | "System" | "Custom";
  previewValue: string;
}

export interface HeaderConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  logoUrl?: string;
  alignment: "left" | "center" | "right";
  showDivider: boolean;
}

export interface FooterConfig {
  enabled: boolean;
  text: string;
  showPageNumbers: boolean;
  showDivider: boolean;
}

export interface DocumentSettings {
  orientation: "portrait" | "landscape";
  margins: "compact" | "normal" | "wide";
  fontFamily: string;
  fontSize: number;
}

export interface TemplateData {
  id?: string;
  title: string;
  header: HeaderConfig;
  body: string;
  footer: FooterConfig;
  settings: DocumentSettings;
}

export interface TemplateEditorProps {
  initialData?: Partial<TemplateData>;
  variables?: VariableItem[];
  saveEndpoint?: string;
  onSave?: (data: TemplateData) => Promise<void> | void;
  onExportPdf?: (data: TemplateData) => void;
  className?: string;
}
