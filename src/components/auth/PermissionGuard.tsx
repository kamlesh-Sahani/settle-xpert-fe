'use client';

import React from 'react';
import { useEmployeeStore } from '@/store/employee.store';
import { isArray } from '@/common/utils/main.utils';

interface PermissionGuardProps {
  required: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export const hasPermission = (requiredPerm: string) => {
  const { employee, permissions } = useEmployeeStore.getState();
  if (!employee) return false;
  return permissions.has(requiredPerm);
};

export function usePermission(required: string | string[]): boolean {
  const isInitialized = useEmployeeStore((state) => state.isInitialized);
  const employee = useEmployeeStore((state) => state.employee);
  const permissions = useEmployeeStore((state) => state.permissions);

  if (!isInitialized || !employee) return false;

  const check = (perm: string) => permissions.has(perm);

  return isArray(required)
    ? required.every(check)
    : check(required);
}

export default function PermissionGuard({ 
  required, 
  children, 
  fallback = null,
  loadingFallback = null
}: PermissionGuardProps) {
  const isInitialized = useEmployeeStore((state) => state.isInitialized);
  // Subscribe to employee and permissions to trigger re-renders on change
  useEmployeeStore((state) => state.employee);
  useEmployeeStore((state) => state.permissions);

  if (!isInitialized) {
    return <>{loadingFallback}</>;
  }

  const isAllowed = isArray(required) 
    ? required.every(perm => hasPermission(perm))
    : hasPermission(required);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
