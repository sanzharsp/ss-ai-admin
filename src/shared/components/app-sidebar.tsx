import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import {useTranslations} from "next-intl";
// Menu items.


export function AppSidebar() {
  const t = useTranslations("shared.components.app-sidebar");

  const items = [
    {
      title: t("home"),
      url: "/",
      icon: Home,
    },

    {
      title: t("calendar"),
      url: "#",
      icon: Calendar,
    },
    {
      title: t("search"),
      url: "#",
      icon: Search,
    },
    {
      title: t("settings"),
      url: "/settings",
      icon: Settings,
    },
  ]
  return (
    <Sidebar>
      <SidebarContent >
        <SidebarGroup>
          <SidebarGroupLabel>{t("title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
