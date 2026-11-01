import CustomerDetailView from "./CustomerDetailView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ customerId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { customerId } = await params;
  return {
    title: `Customer #${customerId}`,
  };
}

export default async function CustomerDetailPage({ params }: Props) {
  const { customerId } = await params;
  return <CustomerDetailView customerId={customerId} />;
}
