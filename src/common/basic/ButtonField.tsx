import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";
import classNames from "classnames";

export interface ButtonProps extends AntButtonProps {
    fullWidth?: boolean;
}

export default function ButtonField({ fullWidth: _fullWidth, className, children, ...props }: ButtonProps) {
    return (
        <AntButton
            className={classNames("flex items-center justify-center font-semibold", className)}
            {...props}
        >
            {children}
        </AntButton>
    );
}