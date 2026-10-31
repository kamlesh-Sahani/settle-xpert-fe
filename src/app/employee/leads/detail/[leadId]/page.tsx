import LeadDetailView from "../LeadDetailView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ leadId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leadId } = await params;
  return {
    title: `Lead #${leadId}`,
  };
}

export default async function LeadDetailPageWithParam({ params }: Props) {
  const { leadId } = await params;
  return <LeadDetailView leadId={leadId} />;
}
