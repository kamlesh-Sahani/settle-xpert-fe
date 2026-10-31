"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LeadDetailView from "./LeadDetailView";

function LeadDetailPageContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("id") || undefined;

  return <LeadDetailView leadId={leadId} />;
}

export default function LeadDetailPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-white" />}>
      <LeadDetailPageContent />
    </Suspense>
  );
}
