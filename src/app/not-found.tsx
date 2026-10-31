import Link from "next/link";
import { ErrorApi } from "@/common/ui/ErrorApi";

export default function NotFound() {
  return (
    <ErrorApi
      fullScreen
      title="404 - Page Not Found"
      message="The page you are looking for does not exist or has been moved."
      action={
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all duration-200"
        >
          Return to Dashboard
        </Link>
      }
    />
  );
}
