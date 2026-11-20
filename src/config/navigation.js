import {
  FileText,
  LayoutDashboard,
  Settings,
  ShieldPlus,
  UserRound,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Health Profile", href: "/profile", icon: UserRound },
  { label: "Medical Documents", href: "/documents", icon: FileText },
  { label: "Emergency Center", href: "/emergency", icon: ShieldPlus },
  { label: "Settings", href: "/settings", icon: Settings },
];
