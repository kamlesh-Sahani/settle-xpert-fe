import React from "react";

export interface DeleteIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const DeleteIcon: React.FC<DeleteIconProps> = ({
  width = 22,
  height = 22,
  className = "",
  ...props
}) => (
  <svg
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22 22"
    {...props}
  >
    <g
      id="Group_202663"
      fill="#e81818"
      data-name="Group 202663"
      transform="translate(-1855.001 -172)"
    >
      <path
        id="Path_293643"
        d="M-165.763-7668.405h15.51l-1.406 13.6-5.17 1.089-7.211-.727-1-4.715Z"
        data-name="Path 293643"
        opacity="0.2"
        transform="translate(2024 7847)"
      />
      <path
        id="Path_293642"
        d="M.759 5.065h6.6v-1.1h-6.6Zm8.8 0h4.4a1.1 1.1 0 1 1 0 2.2h-19.8a1.1 1.1 0 0 1-1.1-1.1 1.1 1.1 0 0 1 1.1-1.1h4.4v-2.2a1.1 1.1 0 0 1 1.1-1.1h8.8a1.1 1.1 0 0 1 1.1 1.1Zm1.1 4.309a1.1 1.1 0 1 1 2.192.183l-1.1 13.2a1.1 1.1 0 0 1-1.1 1.009h-13.2a1.1 1.1 0 0 1-1.1-1.009l-1.1-13.2a1.1 1.1 0 0 1 1.017-1.189 1.1 1.1 0 0 1 1.187 1.006l1.016 12.191H9.647Z"
        data-name="Path 293642"
        transform="translate(1861.942 170.235)"
      />
    </g>
  </svg>
);

export default DeleteIcon;
export { DeleteIcon, DeleteIcon as deleteIcon };
