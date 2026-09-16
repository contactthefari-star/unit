export type TabId =
  | "dashboard"
  | "clients"
  | "closing"
  | "content"
  | "unit"
  | "calendar";

export interface NavItem {
  id: TabId;
  label: string;
  icon: "grid" | "users" | "target" | "megaphone" | "bolt" | "calendar";
  hint: string;
}

export const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid", hint: "Cockpit central" },
  { id: "clients", label: "Clients", icon: "users", hint: "Dossiers & KPIs" },
  { id: "closing", label: "Closing", icon: "target", hint: "Matrice diagnostic" },
  { id: "content", label: "Content Factory", icon: "megaphone", hint: "Personal branding" },
  { id: "unit", label: "UNIT", icon: "bolt", hint: "Collectif & sync" },
  { id: "calendar", label: "Agenda", icon: "calendar", hint: "Timeline 80/20" },
];

export const TAB_LABEL: Record<TabId, string> = NAV.reduce(
  (acc, n) => ({ ...acc, [n.id]: n.label }),
  {} as Record<TabId, string>,
);
