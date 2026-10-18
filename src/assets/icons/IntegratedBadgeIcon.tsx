import React from "react";

const IntegratedBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
    width = 14,
    height = 14,
    className = "flex-shrink-0",
    ...props
}) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M7.1 1.2a1 1 0 011.8 0l.3 1a1 1 0 001.2.7l1-.3a1 1 0 011.3 1.3l-.3 1a1 1 0 00.7 1.2l1 .3a1 1 0 010 1.8l-1 .3a1 1 0 00-.7 1.2l.3 1a1 1 0 01-1.3 1.3l-1-.3a1 1 0 00-1.2.7l-.3 1a1 1 0 01-1.8 0l-.3-1a1 1 0 00-1.2-.7l-1 .3a1 1 0 01-1.3-1.3l.3-1a1 1 0 00-.7-1.2l-1-.3a1 1 0 010-1.8l1-.3a1 1 0 00.7-1.2l-.3-1a1 1 0 011.3-1.3l1 .3a1 1 0 001.2-.7l.3-1z"
            fill="#f28207"
        />
        <circle cx="8" cy="8" r="2.2" fill="#ffffff" />
        <path
            d="M12.5 3.5l-4 4m0 0l-1.5 2 2-1.5 3.5-3.5a1.2 1.2 0 00-1.7-1.7l-.3.2z"
            stroke="#3e70d2"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default IntegratedBadgeIcon;
