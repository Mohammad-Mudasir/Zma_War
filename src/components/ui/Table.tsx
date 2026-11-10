import { cn } from "@/lib/utils";

export function Table({ children, caption, className }: { children: React.ReactNode; caption?: string; className?: string }) {
  return (
    <div className={cn("table-wrap rounded-2xl border border-line bg-surface", className)}>
      <table className="w-full min-w-[34rem] border-collapse text-left">
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("border-b border-line px-4 py-3 text-sm font-semibold text-muted", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-line/70 px-4 py-3.5 align-middle last:border-b-0", className)}>{children}</td>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-muted">
        {children}
      </td>
    </tr>
  );
}
