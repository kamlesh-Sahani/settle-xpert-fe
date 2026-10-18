'use client';

import React from 'react';
import { useUserStore } from '@/store/user.store';
import { isArray } from '@/common/utils/main.utils';

interface PermissionGuardProps {
  required: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export const hasPermission = (requiredPerm: string) => {
  const { user, permissions } = useUserStore.getState();
  if (!user) return false;
  return permissions.has(requiredPerm);
};

export function usePermission(required: string | string[]): boolean {
  const isInitialized = useUserStore((state) => state.isInitialized);
  const user = useUserStore((state) => state.user);
  const permissions = useUserStore((state) => state.permissions);

  if (!isInitialized || !user) return false;

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
  const isInitialized = useUserStore((state) => state.isInitialized);
  // Subscribe to user and permissions to trigger re-renders on change
  useUserStore((state) => state.user);
  useUserStore((state) => state.permissions);

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
