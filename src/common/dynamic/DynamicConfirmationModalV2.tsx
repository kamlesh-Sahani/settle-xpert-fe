import React, { useState } from "react";
import classNames from "classnames";
import DynamicModal from "./DynamicModal";
import { useForm } from "react-hook-form";
import FormStatusMessage from "@/common/form/FormStatusMessage";
import ButtonField from "@/common/basic/ButtonField";
import { responseError } from "@/common/utils/main.utils";

interface ModalItems {
    title?: React.ReactNode;
    subTitle1?: React.ReactNode;
    subTitle2?: React.ReactNode;
    infoBox?: { label: React.ReactNode; value: React.ReactNode }[];
}

interface ModalButtons {
    cancel?: string;
    confirm?: string;
    confirmType?: "primary" | "danger";
    confirmClassName?: string;
    cancelClassName?: string;
}

interface DynamicConfirmationModalV2Props {
    isOpen: boolean;
    onClose: () => void;
    apiRequest?: (url: string, data?: any) => Promise<any>;
    apiUrl?: string;
    apiPayload?: any;
    items?: ModalItems;
    onConfirm?: (data?: any) => void;
    icon?: React.ReactNode;
    buttons?: ModalButtons;
}

export default function DynamicConfirmationModalV2({
    isOpen,
    onClose,
    apiRequest,
    apiUrl,
    apiPayload,
    items,
    onConfirm,
    icon,
    buttons
}: DynamicConfirmationModalV2Props) {
    
    const [status, setStatus] = useState<any>(null);
    const { handleSubmit, formState: { isSubmitting } } = useForm();

    const handleFormSubmit = async () => {
        setStatus(null);
        if (apiUrl && apiRequest) {
            try {
                const res = await apiRequest(apiUrl, apiPayload || {});
                if (res?.data?.success) {
                    setStatus({ type: "success", text: res?.data?.message });
                    if (onConfirm) onConfirm(res.data);
                } else {
                    setStatus({ type: "error", text: res?.data?.message || "Something went wrong" });
                }
            } catch (err: any) {
                setStatus({ type: "error", text: responseError(err) });
            }
        } else {
            if (onConfirm) onConfirm();
        }
    };

    return (
        <DynamicModal
            isOpen={isOpen}
            onClose={onClose}
            hideCloseButton={true}
            headerClassName="hidden"
            className="w-[95%] max-w-[420px] rounded-md shadow-2xl overflow-hidden !border-0 !border-none p-0 bg-background"
            bodyClassName="p-0 overflow-hidden flex flex-col"
            style={{ overlay: { alignItems: 'flex-start', paddingTop: '10vh' }, content: { border: 'none' } }}
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col min-h-[460px]">
                <div className="flex-1 flex flex-col px-4 pt-10 pb-6">
                {/* Centered Icon */}
                {icon && (
                    <div className="flex justify-center mb-6 relative">
                        {icon}
                    </div>
                )}

                {/* Centered Title */}
                {items?.title && (
                    <h2 className="text-center text-text-primary font-semibold text-xl leading-tight mb-5">
                        {items.title}
                    </h2>
                )}

                {/* Info Box */}
                {items?.infoBox && items.infoBox.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center border border-border bg-secondary/30 rounded px-3 py-2.5 mb-5 gap-3">
                        {items.infoBox.map((info, idx) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <div className="h-4 w-[1px] bg-border hidden sm:block"></div>}
                                <div className="text-sm text-text-secondary font-medium whitespace-nowrap">
                                    {info.label} <span className="font-bold text-text-primary">{info.value}</span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="text-center text-text-secondary text-sm leading-relaxed mb-5 font-normal flex flex-col gap-3">
                    {items?.subTitle1 && <p>{items.subTitle1}</p>}
                    {items?.subTitle2 && <p className="text-xs text-text-secondary/80 font-normal">{items.subTitle2}</p>}
                </div>

                {status && (
                    <div className="mb-6">
                        <FormStatusMessage status={status} onDismiss={() => setStatus(null)} />
                    </div>
                )}

                </div>
                {/* Action Buttons (Side by side) */}
                <div className={classNames(
                    "flex flex-row items-center justify-center p-5 mt-auto",
                    buttons?.confirmType === "danger" 
                        ? "gap-4 pt-2 pb-6 border-0 bg-transparent" 
                        : "border-t border-border bg-secondary/30"
                )}>
                    {buttons?.cancel && (
                        <ButtonField 
                            type="default"
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className={classNames(
                                "h-10 text-sm font-semibold text-text-primary bg-background border border-border hover:bg-secondary transition-colors disabled:opacity-50 shadow-none",
                                buttons?.confirmType === "danger"
                                    ? "px-8 rounded-md"
                                    : "w-28 !rounded-l-md !rounded-r-none",
                                buttons?.cancelClassName
                            )}
                        >
                            {buttons.cancel}
                        </ButtonField>
                    )}
                    {buttons?.confirm && (
                        <ButtonField 
                            htmlType="submit"
                            type="primary"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            className={classNames(
                                "h-10 text-sm font-semibold transition-colors shadow-sm flex justify-center items-center text-white",
                                buttons?.confirmType === "danger"
                                    ? "px-6 rounded-md bg-[#dc2626] hover:bg-[#b91c1c] border-0"
                                    : "w-28 !rounded-l-none !rounded-r-md bg-primary border border-primary border-l-0 hover:bg-primary-hover",
                                buttons?.confirmClassName
                            )}
                        >
                            {buttons.confirm}
                        </ButtonField>
                    )}
                </div>
            </form>
        </DynamicModal>
    );
}