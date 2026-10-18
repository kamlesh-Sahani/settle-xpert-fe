import React from "react";
import classNames from "classnames";

export interface ExcelIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const ExcelIcon: React.FC<ExcelIconProps> = ({
  width = 26,
  height = 26,
  className = "",
  fill = "currentColor",
  ...props
}) => (
  <svg
    id="Group_6698"
    data-name="Group 6698"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 26 26"
    width={width}
    height={height}
    fill={fill}
    className={classNames("text-primary", className)}
    {...props}
  >
    {/* White backing so the letter X and spreadsheet cells are always crisp white */}
    <rect x="16" y="3" width="9.5" height="20" fill="#fff" />
    <path d="M0,2.889V23.112L15.09,26V0Z" fill="#fff" />
    <path
      id="Path_445"
      data-name="Path 445"
      d="M25.217,3H16V5.979h3.049V8.006H16V9.987h3.018v2H16v2h3.018v2H16v2h3.018v2H16v2.995h9.217a.858.858,0,0,0,.843-.868V3.868A.858.858,0,0,0,25.217,3ZM24.048,19.969H20.024v-2h4.024Zm0-3.993H20.024v-2h4.024Zm0-3.993H20.024v-2h4.024Zm0-3.993H20.024v-2h4.024Z"
      transform="translate(-0.06 0.018)"
      fill="currentColor"
    />
    <path
      id="Path_446"
      data-name="Path 446"
      d="M0,2.889V23.112L15.09,26V0ZM9.545,18.08l-1.756-3.3a2.913,2.913,0,0,1-.206-.678H7.556a5.113,5.113,0,0,1-.235.707L5.559,18.08H2.824l3.247-5.064L3.1,7.951H5.893L7.35,10.988a5.285,5.285,0,0,1,.306.854h.028q.086-.3.32-.883L9.624,7.95h2.557L9.126,12.972l3.141,5.107Z"
      fill="currentColor"
    />
  </svg>
);

export default ExcelIcon;
export { ExcelIcon, ExcelIcon as excelIcon };
