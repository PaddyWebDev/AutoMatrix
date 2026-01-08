import {
  Boxes,
  Calendar,
  CalendarDays,
  Car,
  FileText,
  Home,
  LocateFixedIcon,
  LucideIcon,
  MessageSquare,
  Receipt,
  Search,
  Settings,
  User,
  Wrench,
} from "lucide-react";

export enum userType {
  ADMIN,
  CUSTOMER,
  SERVICE_CENTER,
}
export type linksType = {
  label: string;
  href: string;
  icon: string;
};

export const iconMap = new Map<string, LucideIcon>([
  ["home", Home],
  ["locateFixedIcon", LocateFixedIcon],
  ["settings", Settings],
  ["user", User],
  ["calendar", Calendar],
  ["car", Car],
  ["search", Search],
  ["calendarDays", CalendarDays],
  ["boxes", Boxes],
  ["receipt", Receipt],
  ["wrench", Wrench],
  ["messageSquare", MessageSquare],
  ["fileText",FileText]

]);
