import React from "react";

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
    width = 68,
    height = 68,
    className = "",
    ...props
}) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M30.5359 7.00001C32.0755 4.33334 35.9245 4.33334 37.4641 7.00001L64.3038 53.5C65.8434 56.1667 63.9189 59.5 60.8397 59.5H7.16025C4.08105 59.5 2.15655 56.1667 3.69615 53.5L30.5359 7.00001Z"
            fill="#DC2626"
        />
        <rect x="31.5" y="21" width="5" height="18" rx="2.5" fill="white" />
        <circle cx="34" cy="46" r="3" fill="white" />
    </svg>
);

export default WarningIcon;
