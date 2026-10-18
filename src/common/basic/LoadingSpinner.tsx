import React from 'react';
import { Spin } from 'antd';
import type { SpinProps } from 'antd';

interface LoadingSpinnerProps extends Omit<SpinProps, 'size'> {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large' | 'default';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'medium',
  ...props
}) => {
  const normalizedSize = size === 'default' ? 'medium' : size;
  const spinner = <Spin size={normalizedSize} {...props} />;

  if (fullScreen) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
