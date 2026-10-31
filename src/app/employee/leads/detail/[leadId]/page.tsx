"use client";

import { useParams } from "next/navigation";
import LeadDetailView from "../LeadDetailView";

export default function LeadDetailPageWithParam() {
  const params = useParams();
  const leadId = params?.leadId as string;

  return <LeadDetailView leadId={leadId} />;
}
