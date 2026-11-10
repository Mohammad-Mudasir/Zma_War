// Nothing to guard here: /admin/login must stay reachable.
// Everything else sits in the (panel) group, which requires the administrator.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
