import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

export interface SubmitStatusType {
    type: 'success' | 'error';
    text: string;
}

interface FormStatusMessageProps {
    status: SubmitStatusType | null;
    className?: string;
    /** Duration in milliseconds before success message automatically vanishes. Defaults to 3500ms. Set to 0 to disable. */
    duration?: number;
    onDismiss?: () => void;
}

export default function FormStatusMessage({ status, className, duration = 3500, onDismiss }: FormStatusMessageProps) {
    const [visibleStatus, setVisibleStatus] = useState<SubmitStatusType | null>(status);

    useEffect(() => {
        setVisibleStatus(status);

        if (status && status.type === 'success' && duration > 0) {
            const timer = setTimeout(() => {
                setVisibleStatus(null);
                onDismiss?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [status, duration, onDismiss]);

    if (!visibleStatus) return null;

    const isError = visibleStatus.type === 'error';
    
    return (
        <div className={classNames(
            "flex items-center gap-1.5 text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300 transition-opacity",
            isError ? "text-red-500" : "text-emerald-500",
            className
        )}>
            <span>{visibleStatus.text}</span>
        </div>
    );
}
