import { useCallback, useMemo, useState } from "react";
import { Control, Controller, FieldValues } from "react-hook-form";
import { Form, Upload, Tooltip, App } from "antd";
import {
  FiUploadCloud,
  FiTrash2,
  FiEye,
  FiPlus,
} from "react-icons/fi";
import { BsQuestionCircle } from "react-icons/bs";
import { FieldConfig } from "@/types/formField.types";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { UploadFile, UploadProps } from "antd";

const PreviewModal = dynamic(() => import("./PreviewModal"), { ssr: false });
import { getFileIcon, getFileColorClass, getPreviewStrategy } from "./fileTypes";
import classNames from "classnames";
import { uploadApi } from "@/common/utils/api";
import { uploadFileToS3 } from "./uploadService";
import { isNotEmptyArray } from "@/common/utils/main.utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UploadFieldProps extends Omit<Partial<FieldConfig>, "type"> {
  id: string;
  name?: string;
  control: Control<FieldValues, any, FieldValues>;
  onChange?: (files: UploadFile[]) => void;
  className?: string;
  /** S3 folder to place the uploaded file into (e.g. "avatars", "logos", "invoices"). Default: "uploads" */
  folder?: string;
  /** Value format stored in react-hook-form: "files" (array) or "url" (single URL string). Default: "files" */
  valueType?: "files" | "url";
  /** Accepts the field type from DynamicFields (e.g. "file", "image") – used for compatibility, not consumed internally */
  type?: string;

  /* ---- Customisation ---- */
  /** Icon rendered in the dropzone (ReactNode) */
  icon?: React.ReactNode;
  /** Primary text in the dropzone */
  title?: string;
  /** Secondary hint text */
  subtitle?: string;
  /** Label on the action button */
  buttonText?: string;
  /** Ant Button type */
  buttonType?: "primary" | "default" | "dashed" | "link" | "text";
  /** Custom button background color */
  buttonColor?: string;
  /** Tooltip shown next to the title */
  infoTooltip?: string;
  /** Accepted file types */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Max number of files */
  maxCount?: number;
  /** Max file size in MB – files exceeding this are rejected in beforeUpload */
  maxSizeMB?: number;
  /** Disable the field */
  disabled?: boolean;
  /** Called when preview icon is clicked */
  onPreview?: (file: UploadFile) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Human-readable file size */
const formatSize = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UploadField(props: UploadFieldProps) {
  const {
    id,
    name,
    control,
    onChange,
    className,
    folder = "uploads",
    valueType = "files",

    // Customisable UI
    icon,
    title = "Click or drag file here",
    subtitle,
    buttonText = "Choose File",
    buttonType: _buttonType,
    buttonColor: _buttonColor,
    infoTooltip,
    accept,
    multiple = false,
    maxCount,
    maxSizeMB,
    disabled = false,
    onPreview: onPreviewProp,
  } = props;

  const { message } = App.useApp();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  /* ---- Auto-generated subtitle ---- */
  const resolvedSubtitle = useMemo(() => {
    if (subtitle) return subtitle;
    const parts: string[] = [];
    if (accept) parts.push(accept.replace(/\./g, "").replace(/,/g, ", ").toUpperCase());
    if (maxSizeMB) parts.push(`Max ${maxSizeMB} MB`);
    if (maxCount && multiple) parts.push(`Upto ${maxCount}`);
    return isNotEmptyArray(parts) ? parts.join(" | ") : undefined;
  }, [subtitle, accept, maxSizeMB, maxCount, multiple]);

  /* ---- beforeUpload: validate size ---- */
  const beforeUpload = useCallback(
    (file: File) => {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        message.error(`File must be smaller than ${maxSizeMB}MB`);
        return Upload.LIST_IGNORE;
      }
      return true; // Allow upload
    },
    [maxSizeMB],
  );



  /* ---- customRequest: upload to S3 ---- */
  const customRequest: UploadProps["customRequest"] = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      const result = await uploadFileToS3(file as File, {
        folder,
        onProgress: (percent) => onProgress?.({ percent }),
      });
      onSuccess?.(result);
    } catch (err: any) {
      onError?.(new Error(err?.response?.data?.message || err?.message || "Upload failed"));
    }
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <Controller
      name={(name || "") + id}
      control={control}
      render={({ field, fieldState }) => {
        const isUrlMode = valueType === "url" || (maxCount === 1 && typeof field.value === "string");
        const fileList: UploadFile[] = useMemo(() => {
          if (Array.isArray(field.value)) return field.value;
          if (typeof field.value === "string" && field.value) {
            return [{ uid: "-1", name: "image", status: "done", url: field.value }];
          }
          return [];
        }, [field.value]);
        const hasFiles = isNotEmptyArray(fileList);

        const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
          // Map the response url and key to file
          const updatedList = newList.map(file => {
            if (file.status === 'done' && file.response) {
              if (file.response.url) {
                file.url = file.response.url;
              }
              if (file.response.key) {
                (file as any).key = file.response.key;
              }
            }
            return file;
          });

          if (isUrlMode) {
            const singleUrl = updatedList[0]?.url || updatedList[0]?.response?.url || "";
            field.onChange(singleUrl);
          } else {
            field.onChange(updatedList);
          }
          onChange?.(updatedList);
        };

        const handleRemove = async (file: UploadFile) => {
          const fileKey = file.response?.key || (file as any).key;
          if (fileKey) {
            try {
              await uploadApi.deleteFiles([fileKey]);
            } catch (err) {
              console.warn("Failed to delete file from storage:", err);
            }
          }
          const updated = fileList.filter((f) => f.uid !== file.uid);
          if (isUrlMode) {
            field.onChange("");
          } else {
            field.onChange(updated);
          }
          onChange?.(updated);
        };

        const handlePreview = async (file: UploadFile) => {
          if (onPreviewProp) {
            onPreviewProp(file);
            return;
          }
          const idx = fileList.findIndex(f => f.uid === file.uid);
          setPreviewIndex(idx >= 0 ? idx : 0);
          setPreviewOpen(true);
        };

        /* -- Custom dropzone content (Trackwick Style) -- */
        const dropzoneContent = (
          <div className={classNames(
            "flex flex-col items-center justify-center w-full h-full min-h-[200px] py-6 px-4 text-center border border-solid border-border rounded-[12px] transition-colors",
            disabled ? "opacity-50 cursor-not-allowed bg-secondary/50 pointer-events-none" : "hover:border-primary bg-secondary cursor-pointer"
          )}>
            <div className="text-text-secondary mb-3 flex items-center justify-center">
              {icon || <FiUploadCloud className="text-[50px] text-text-secondary" />}
            </div>

            <div className="flex items-center justify-center gap-1 text-[14px] font-semibold text-text-primary mb-1">
              <span>{title || "Drag & Drop Profile Image"}</span>
              {infoTooltip && (
                <Tooltip title={infoTooltip} placement="top">
                  <BsQuestionCircle className="text-[12px] cursor-help hover:text-text-primary" />
                </Tooltip>
              )}
            </div>

            {resolvedSubtitle && (
              <span className="text-[12px] font-medium text-text-secondary mb-4">{resolvedSubtitle}</span>
            )}
            
            <div className="flex items-center w-full max-w-[180px] mb-4">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-3 text-[12px] font-semibold text-text-secondary">OR</span>
                <div className="flex-1 border-t border-border"></div>
            </div>
            
            <span className="text-[14px] font-semibold text-primary">
                {buttonText || "Upload File"}
            </span>
          </div>
        );

        /* -- Uploaded file card renderer (picture-card style) -- */
        const itemRender = (
          _originNode: React.ReactElement,
          file: UploadFile,
          _fileList: UploadFile[],
          actions: { download: () => void; preview: () => void; remove: () => void },
        ) => {
          const strategy = getPreviewStrategy(file.name || "", file.type || "");
          const isImg = strategy === "image";
          const thumbSrc = file.thumbUrl || file.url || file.preview || "";

          return (
            <div className="group relative w-[104px] h-[104px] rounded-lg border border-border bg-secondary overflow-hidden">
              {/* Thumbnail or file icon */}
              {isImg && thumbSrc ? (
                <Image
                  src={thumbSrc}
                  alt={file.name || "Upload"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-2">
                  <span className={classNames("flex-shrink-0", getFileColorClass(file.name || "", file.type || ""))}>
                    {getFileIcon(file.name || "", file.type || "", { size: 40 })}
                  </span>
                  <span className="text-[10px] text-text-secondary font-medium px-1 truncate w-full text-center">
                    {file.name}
                  </span>
                </div>
              )}

              {/* File size badge */}
              {file.size && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                  {formatSize(file.size)}
                </span>
              )}

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.preview();
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-background/90 text-text-primary hover:bg-background hover:text-primary transition-all cursor-pointer text-sm"
                  title="Preview"
                >
                  <FiEye />
                </button>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.remove();
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-background/90 text-text-primary hover:bg-background hover:text-danger transition-all cursor-pointer text-sm"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          );
        };

        /* ----- Main upload component ----- */
        return (
          <Form.Item
            validateStatus={fieldState.error ? "error" : ""}
            help={fieldState.error?.message}
            className="mb-0"
          >
            <Upload
              listType={hasFiles ? "picture-card" : "text"}
              fileList={fileList}
              onChange={handleChange}
              onRemove={handleRemove}
              onPreview={handlePreview}
              customRequest={customRequest}
              beforeUpload={beforeUpload}
              accept={accept}
              multiple={multiple}
              maxCount={multiple ? maxCount : 1}
              disabled={disabled}
              showUploadList={hasFiles ? { showPreviewIcon: true, showRemoveIcon: !disabled } : false}
              className={classNames(className, !hasFiles ? "[&_.ant-upload]:w-full [&_.ant-upload]:h-full [&_.ant-upload]:block [&_.ant-upload]:!border-0 [&_.ant-upload]:!bg-transparent" : "[&_.ant-upload]:!border-solid [&_.ant-upload]:!border-border hover:[&_.ant-upload]:!border-primary [&_.ant-upload]:!bg-secondary hover:[&_.ant-upload]:!bg-secondary/80")}
              itemRender={hasFiles ? itemRender : undefined}
            >
              {(() => {
                if (!hasFiles) {
                  return dropzoneContent;
                }
                if (multiple && (!maxCount || fileList.length < maxCount)) {
                  return (
                    <div className="flex flex-col items-center justify-center w-full h-full text-text-secondary hover:text-primary transition-colors">
                      <FiPlus className="text-2xl mb-1" />
                      <span className="text-xs">Upload</span>
                    </div>
                  );
                }
                return null;
              })()}
            </Upload>

            {/* Preview modal */}
            {
              previewOpen && <PreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                files={fileList}
                initialIndex={previewIndex}
                onDelete={handleRemove}
              />
            }

          </Form.Item>
        );
      }}
    />
  );
}