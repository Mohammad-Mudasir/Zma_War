import { Loader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader label="Loading…" />
    </div>
  );
}
