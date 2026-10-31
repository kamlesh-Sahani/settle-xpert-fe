import LoadingSpinner from "@/common/basic/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex w-full min-h-[50vh] items-center justify-center p-8">
      <LoadingSpinner size="large" />
    </div>
  );
}
