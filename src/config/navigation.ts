import {
  FileText,
  IdCard,
  LayoutDashboard,
  Settings,
  ShieldPlus,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Health Profile", href: "/profile", icon: UserRound },
  { label: "Medical Documents", href: "/documents", icon: FileText },
  { label: "ID & Insurance", href: "/id-insurance", icon: IdCard },
  { label: "Emergency Center", href: "/emergency", icon: ShieldPlus },
  { label: "Settings", href: "/settings", icon: Settings },
];
