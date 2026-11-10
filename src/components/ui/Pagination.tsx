import Link from "next/link";
import { buttonClass } from "./Button";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  /** Other query parameters to keep, e.g. the current filter. */
  params?: Record<string, string | undefined>;
};

export function Pagination({ page, totalPages, basePath, params = {} }: Props) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    qs.set("page", String(p));
    return `${basePath}?${qs.toString()}`;
  };

  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-3 pt-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonClass({ variant: "secondary", size: "sm" })}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={buttonClass({ variant: "secondary", size: "sm" })}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
