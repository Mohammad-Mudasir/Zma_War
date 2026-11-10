import { SideNav } from "./Sidebar";

const items = [
  { href: "/admin/dashboard", label: "Today" },
  { href: "/admin/appointments", label: "Schedule" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  return <SideNav items={items} label="Administration" />;
}
